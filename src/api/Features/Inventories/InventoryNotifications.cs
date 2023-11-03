using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using Serilog;

namespace api.Features;
public static class InventoryNotifications {
    public record EditNotification : INotification {
        public EditNotification(int inventoryId) {
            Id = inventoryId;
        }

        public int Id { get; }
    }
    public record SubmitNotification : INotification {
        public SubmitNotification(Site site, Inventory inventory, Account account) {
            Inventory = inventory;
            Site = site;
            Account = account;
        }

        public Inventory Inventory { get; }
        public Site Site { get; set; }
        public Account Account { get; set; }
        public NotificationTypes NotificationType { get; } = NotificationTypes.inventory_submission;
    }
    public record RejectNotification : INotification {
        public RejectNotification(Site site, Inventory inventory, Account account, IEnumerable<string?> contacts) {
            Inventory = inventory;
            Site = site;
            Account = account;
            Contacts = contacts?.Where(x => !string.IsNullOrEmpty(x))
              .Select(c => new EmailAddress(c)).ToList() ?? new List<EmailAddress>(0);
        }

        public Inventory Inventory { get; }
        public Site Site { get; set; }
        public Account Account { get; set; }
        public List<EmailAddress> Contacts { get; }
    }
    public record DeleteNotification : INotification {
        public DeleteNotification(Inventory inventory) {
            InventoryId = inventory.Id;
            SiteId = inventory.SiteFk;
        }

        public int InventoryId { get; }
        public int SiteId { get; set; }
    }

    public class EditNotificationHandler(IAppDbContext context, ILogger log) : INotificationHandler<EditNotification> {
        private readonly IAppDbContext _context = context;
        private readonly ILogger _log = log;

        private static bool GetWellContactStatus(Inventory entity) {
            if (entity.SubClass == 5002) {
                return entity.Site?.Contacts.Any(x => x.SerContact) ?? false;
            }

            return true;
        }

        private static bool GetPaymentStatus(Inventory entity) {
            IReadOnlyList<int> subClasses = new List<int> { -1, 5047, 5002, 5101, 5026 };

            return entity.OrderNumber >= 1000000 && entity.OrderNumber <= 9999999 && subClasses.Contains(entity.SubClass);
        }
        private static bool GetLocationStatus(Inventory entity) {
            var hasAtLeastOneWell = entity.Wells.Count > 0;

            if (!hasAtLeastOneWell) {
                return false;
            }

            return entity.Wells.All(x =>
              !string.IsNullOrEmpty(x.WellName) &&
              !string.IsNullOrEmpty(x.Status) && x.Quantity > 0 &&
              !string.IsNullOrEmpty(x.Geometry)
            );
        }
        private static bool GetWellDetailsStatus(Inventory entity) {
            var hasAtLeastOneWell = entity.Wells.Count > 0;

            if (!hasAtLeastOneWell) {
                return false;
            }

            var hasConstructionDetails = entity.Wells.All(x => !string.IsNullOrEmpty(x.ConstructionDetails));

            if (entity.Wells.Any(x => x.SubClass == 5002)) {
                var serHasInjectate = entity.Wells
                  .Where(x => x.SubClass == 5002)
                  .Any(w => !string.IsNullOrEmpty(w.InjectateCharacterization));

                return hasConstructionDetails && serHasInjectate;
            }

            return hasConstructionDetails;
        }
        private static bool GetSignatureStatus(Inventory entity) => !string.IsNullOrEmpty(entity.Signature);
        private static InventoryStatus GetInventoryStatus(Inventory entity) {
            var currentStatus = new List<bool> { entity.DetailStatus, entity.LocationStatus, entity.SignatureStatus };

            if (entity.SubClass == 5002) {
                currentStatus.Add(entity.ContactStatus);
            }

            var status = currentStatus.All(x => x) ? InventoryStatus.Complete : InventoryStatus.Incomplete;

            if (status == InventoryStatus.Complete && entity.SubmittedOn.HasValue) {
                status = InventoryStatus.Submitted;
            }

            return status;
        }
        public async Task Handle(EditNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling Inventory notification");

            var entity = await _context.Inventories
              .Include(x => x.Wells)
              .Include(x => x.Site)
              .Include(x => x.Site.Contacts)
              .SingleOrDefaultAsync(s => s.Id == notification.Id, token);

            if (entity == null) {
                return;
            }

            entity.PaymentStatus = GetPaymentStatus(entity);
            entity.LocationStatus = GetLocationStatus(entity);
            entity.ContactStatus = GetWellContactStatus(entity);
            entity.DetailStatus = GetWellDetailsStatus(entity);
            entity.SignatureStatus = GetSignatureStatus(entity);

            entity.Status = GetInventoryStatus(entity);

            _log.ForContext("inventory", entity)
              .Debug("Updating inventory status");

            await _context.SaveChangesAsync(token);
        }
    }
    public class CreateSubmissionNotificationHandler(IAppDbContext context, ILogger log) : INotificationHandler<SubmitNotification> {
        private readonly IAppDbContext _context = context;
        private readonly ILogger _log = log;

        private Notification CreateNotifications(SubmitNotification metadata) {
            var notification = NotificationHelpers.CreateBasicNotification(_context, metadata.NotificationType);
            var initials = NotificationHelpers.GetInitials(metadata.Account);

            notification.AdditionalData = new Dictionary<string, object> {
                    { "name", initials },
                    { "inventoryId", metadata.Inventory.Id },
                };
            notification.Url = $"/review/site/{metadata.Site.Id}/inventory/{metadata.Inventory.Id}";

            return notification;
        }
        public async Task Handle(SubmitNotification metadata, CancellationToken token) {
            _log.ForContext("notification", metadata)
              .Debug("Handling inventory submission notification");

            var notifications = CreateNotifications(metadata);

            _context.Notifications.Add(notifications);
            await _context.SaveChangesAsync(token);
        }
    }
    public class SendRegulatorySubmissionEmailHandler(EmailService client, ILogger log) : INotificationHandler<SubmitNotification> {
        private readonly EmailService _client = client;
        private readonly ILogger _log = log;

        public async Task Handle(SubmitNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling inventory submission client email");

            var message = new SendGridMessage {
                From = new EmailAddress("no-reply@utah.gov", "UIC Inventory App"),
                Subject = "UIC Inventory App: Inventory Submission Received",
            };
            message.AddContent(
              MimeType.Html,
              $@"<h1>We thank you for your submission 🙏</h1>
          <p>The inventory has been received by the UIC Inventory Staff. The staff have been notified and someone will
           review your submission in the order it was received.</p>
          <h2>Submission Summary</h2>
          <ul>
            <li>{WellLookup.WellType(notification.Inventory.SubClass)} - Inventory #{notification.Inventory.Id} (Order #{notification.Inventory.OrderNumber})</li>
            <li>{notification.Site.Name} - Site #{notification.Site.Id}</li>
            <li>Submission Date: {notification.Inventory.SubmittedOn:yyyy/MM/dd}</li>
            <li>Signed for by: {notification.Inventory.Signature}</li>
          </ul>
          <p>Have a great day,</p>
          <p>The UIC Staff</p>
          Division of Water Quality
          <a href=""https://deq.utah.gov/division-water-quality"">waterquality.utah.gov</a>"
            );

            message.AddTo(new EmailAddress(notification.Account.Email, $"{notification.Account.FirstName} {notification.Account.LastName}"));

            var response = await _client.SendEmailAsync(message, token);

            if (!response.IsSuccessStatusCode) {
                _log.ForContext("message", message)
                .ForContext("response", response)
                  .Error("Failed to send client inventory submission email");
            } else {
                _log.ForContext("message", message)
                  .ForContext("response", response)
                  .Debug("Sent inventory submission client email");
            }
        }
    }
    public class SendAdminSubmissionEmailHandler(EmailService client, IConfiguration configuration, ILogger log) : INotificationHandler<SubmitNotification> {
        private readonly EmailService _client = client;
        private readonly ILogger _log = log;
        public readonly string _email = configuration.GetSection("App").GetValue<string>("AdminEmail") ?? string.Empty;

        public async Task Handle(SubmitNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling inventory submission admin email");

            var message = new SendGridMessage {
                From = new EmailAddress(notification.Account.Email, $"{notification.Account.FirstName} {notification.Account.LastName}"),
                Subject = "UIC Inventory App: Inventory Submission Notification",
            };
            message.AddContent(
              MimeType.Html,
              $@"<h1>There is a submission ready for your review 🔬</h1>
          <p>{notification.Account.FirstName} {notification.Account.LastName} submitted the following inventory:</p>
          <h2>Submission Summary</h2>
          <ul>
            <li>{WellLookup.WellType(notification.Inventory.SubClass)} - Inventory #{notification.Inventory.Id} (Order #{notification.Inventory.OrderNumber})</li>
            <li>{notification.Site.Name} - Site #{notification.Site.Id}</li>
            <li>Submission Date: {notification.Inventory.SubmittedOn:yyyy/MM/dd}</li>
            <li>Signed for by: {notification.Inventory.Signature}</li>
          </ul>
          <p>🎉 Have a great day! 🎉</p>"
            );

            message.AddTo(new EmailAddress(_email, "UIC Administrators"));

            var response = await _client.SendEmailAsync(message, token);

            if (!response.IsSuccessStatusCode) {
                _log.ForContext("message", message)
                .ForContext("response", response)
                  .Error("Failed to send admin inventory submission email");
            } else {
                _log.ForContext("message", message)
                  .ForContext("response", response)
                  .Debug("Sent inventory submission admin email");
            }
        }
    }
    public class SendSubmissionRejectionEmailHandler(EmailService client, IConfiguration configuration, ILogger log) : INotificationHandler<RejectNotification> {
        private readonly EmailService _client = client;
        private readonly ILogger _log = log;
        public readonly string _email = configuration.GetSection("App").GetValue<string>("AdminEmail") ?? string.Empty;

        public async Task Handle(RejectNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling inventory rejection email");

            var message = new SendGridMessage {
                From = new EmailAddress(_email, "UIC Administrators"),
                Subject = $"UIC Class V Inventory Submittal Rejected - {notification.Site.Name}",
            };
            message.AddContent(
              MimeType.Html,
              $@"<h1>The submission for {notification.Site.Name} has been rejected</h1>
          <p>The UIC Class V inventory submittal with the Utah Division of Water Quality has been rejected.</p>
          <h2>Contact us</h2>
          <p>If you have any questions please reply to this email ({_email}).</p>"
            );

            message.AddTos(notification.Contacts);

            var response = await _client.SendEmailAsync(message, token);

            if (!response.IsSuccessStatusCode) {
                _log.ForContext("message", message)
                .ForContext("response", response)
                  .Error("Failed to send inventory rejection email");
            } else {
                _log.ForContext("message", message)
                  .ForContext("response", response)
                  .Debug("Sent inventory rejection email");
            }
        }
    }
    public class RemoveCloudStorageHandler(CloudStorageService cloud, IConfiguration configuration, ILogger log) : INotificationHandler<DeleteNotification> {
        private readonly ILogger _log = log;
        private readonly string _bucket = configuration.GetValue<string>("STORAGE_BUCKET") ?? string.Empty;
        private readonly CloudStorageService _client = cloud;

        public async Task Handle(DeleteNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling inventory deletion cloud storage removal");

            await _client.RemoveObjectsAsync(_bucket, $"site_{notification.SiteId}/inventory_{notification.InventoryId}/", token);
        }
    }
    public class GroundWaterProtectionsHandler(IHttpClientFactory clientFactory, IAppDbContext context, IWaterSystemContactService service, ILogger log) : INotificationHandler<SubmitNotification> {
        public record ProtectionResult(int WellId, string Service, bool Intersects, IReadOnlyList<Feature> Features);
        public record ProtectionQuery(int WellId, string Service, string Url);
        public record Protections(bool Aquifers, bool GroundWater);

        private const string AquiferRechargeDischargeAreas = "https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/Aquifer_RechargeDischargeAreas/FeatureServer/0";
        private const string GroundWaterFeatureServiceUrl = "https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Groundwater_Source_Protection_Zones/FeatureServer/0";
        private readonly HttpClient _client = clientFactory.CreateClient("esri");
        private readonly IWaterSystemContactService _service = service;
        private readonly IAppDbContext _context = context;
        private readonly ILogger _log = log;

        public async Task Handle(SubmitNotification notification, CancellationToken token) {
            _log.ForContext("notification", notification)
              .Debug("Handling well ground water protection intersections");

            var wells = notification.Inventory.Wells.Select(well => new { well.Id, well.Geometry });

            var urls = new List<ProtectionQuery>();
            var queryResults = new Dictionary<int, List<ProtectionResult>>();

            foreach (var well in wells) {
                if (well.Geometry == null) {
                    continue;
                }

                var queryString = new QueryBuilder {
                    { "where", string.Empty },
                    { "geometry", well.Geometry },
                    { "geometryType", "esriGeometryPoint" },
                    { "spatialRel", "esriSpatialRelIntersects" },
                    { "returnCountOnly", true.ToString() },
                    { "f", "json" }
                };

                var gwzQueryString = new QueryBuilder {
                    { "where", string.Empty },
                    { "geometry", well.Geometry },
                    { "geometryType", "esriGeometryPoint" },
                    { "spatialRel", "esriSpatialRelIntersects" },
                    { "returnGeometry", false.ToString() },
                    { "outFields", "SYSNUMBER" },
                    { "f", "json" }
                };

                urls.Add(new ProtectionQuery(
                  well.Id,
                  "Aquifer Recharge/Discharge Areas",
                  $"{AquiferRechargeDischargeAreas}/query?{queryString}")
                );

                urls.Add(new ProtectionQuery(
                  well.Id,
                  "Ground Water",
                  $"{GroundWaterFeatureServiceUrl}/query?{gwzQueryString}")
                );

                queryResults[well.Id] = new List<ProtectionResult>();
            }

            var options = new JsonSerializerOptions {
                PropertyNameCaseInsensitive = true
            };

            await Task.WhenAll(urls.Select(async item => {
                using var response = await _client.GetAsync(item.Url, token);
                using var content = await response.Content.ReadAsStreamAsync(token);

                var queryResult = await JsonSerializer.DeserializeAsync<EsriQueryResponse>(content, options, cancellationToken: token);

                if (queryResult is null || queryResult?.IsSuccessful != true) {
                    _log.ForContext("queryResult", queryResult)
                      .Error("Failed to query {id} for water protection intersections", item.WellId);

                    return;
                }

                _log.Debug("Got {@queryResult} result for {wellId}", queryResult, item.WellId);

                var success = queryResult.Count > 0 || queryResult.Features.Count > 0;

                queryResults[item.WellId].Add(new ProtectionResult(item.WellId, item.Service, success, queryResult.Features));
            }));

            var groundWaterCodes = new[] { "Y+", "Y-" };

            foreach (var item in queryResults) {
                _log.Debug("Choosing code for {@item}", item);

                var has = new Protections(
                  item.Value.Any(x => x.Service == "Aquifer Recharge/Discharge Areas" && x.Intersects),
                  item.Value.Any(x => x.Service == "Ground Water" && x.Intersects)
                );

                var well = notification.Inventory.Wells.SingleOrDefault(x => x.Id == item.Key);

                if (well == null) {
                    _log.Warning("Well {Id} not found in database. unable to update surface water protection", item.Key);
                    continue;
                }

                well.SurfaceWaterProtection = DetermineCode(has);

                if (groundWaterCodes.Contains(well.SurfaceWaterProtection)) {
                    _log.Debug("Intersects GWZ, fetching contacts");

                    var systemNumbers = item.Value.
                      SelectMany(x => x.Features.Select(x => x.Attributes.SysNumber))
                      .Distinct() ?? Enumerable.Empty<string>();

                    var pwdIds = systemNumbers.Select(x => $"UTAH{x}").ToList();

                    var contacts = await _service.GetContactsAsync(pwdIds, token);

                    foreach (var contact in contacts) {
                        var name = contact.Name;

                        if (name.Contains(',')) {
                            var parts = name.Split(',');

                            name = $"{parts[1].Trim()} {parts[0].Trim()}";
                        }

                        _context.WaterSystemContacts.Add(new WaterSystemContacts {
                            SiteFk = well.SiteFk,
                            InventoryFk = well.InventoryFk,
                            WellFk = well.Id,
                            AccountFk = well.AccountFk,
                            Name = name,
                            Email = contact.Email,
                            System = contact.System
                        });
                    }
                }

                _context.Wells.Update(well);
            }

            await _context.SaveChangesAsync(token);
        }

        public static string DetermineCode(Protections has) => has switch {
            (Aquifers: true, GroundWater: true) => "Y+",
            (Aquifers: false, GroundWater: true) => "Y-",
            (Aquifers: true, GroundWater: false) => "S",
            (Aquifers: false, GroundWater: false) => "N",
            _ => "U",
        };
    }
}
