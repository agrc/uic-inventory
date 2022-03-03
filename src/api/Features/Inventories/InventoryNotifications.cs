using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using MediatR;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using Serilog;

namespace api.Features {
  public static class InventoryNotifications {
    public class EditNotification : INotification {
      public EditNotification(int inventoryId) {
        Id = inventoryId;
      }

      public int Id { get; }
    }

    public class SubmitNotification : INotification {
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

    public class RejectNotification : INotification {
      public RejectNotification(Site site, Inventory inventory, Account account, IEnumerable<string?> contacts, IEnumerable<string?> files) {
        Inventory = inventory;
        Site = site;
        Account = account;
        Contacts = contacts?.Where(x => !string.IsNullOrEmpty(x))
          .Select(c => new EmailAddress(c)).ToList() ?? new List<EmailAddress>(0);
        Files = files ?? Array.Empty<string?>();
      }

      public Inventory Inventory { get; }
      public Site Site { get; set; }
      public Account Account { get; set; }
      public List<EmailAddress> Contacts { get; }
      public IEnumerable<string?> Files { get; }
    }

    public class EditNotificationHandler : INotificationHandler<EditNotification> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;

      public EditNotificationHandler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
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

    public class CreateSubmissionNotificationHandler : INotificationHandler<SubmitNotification> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;
      public CreateSubmissionNotificationHandler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }

      public async Task Handle(SubmitNotification notification, CancellationToken token) {
        _log.ForContext("notification", notification)
          .Debug("Handling inventory submission notification");

        var ids = _context.Accounts.Where(x => x.ReceiveNotifications == true).Select(x => x.Id);
        var recipients = new List<NotificationReceipt>();

        foreach (var id in ids) {
          recipients.Add(new NotificationReceipt {
            RecipientId = id
          });
        }

        var initials = "ID";
        if (notification.Account?.FirstName != null && notification.Account?.LastName != null) {
          initials = string.Concat(notification.Account.FirstName.AsSpan(0, 1), notification.Account.LastName.AsSpan(0, 1));
        }

        var item = new Notification {
          CreatedAt = DateTime.UtcNow,
          NotificationType = notification.NotificationType,
          AdditionalData = new Dictionary<string, object> {
            { "name", initials },
            { "inventoryId", notification.Inventory.Id },
          },
          Url = $"/review/site/{notification.Site.Id}/inventory/{notification.Inventory.Id}",
          NotificationReceipts = recipients
        };

        _context.Notifications.Add(item);

        await _context.SaveChangesAsync(token);
      }
    }

    public class SendRegulatorySubmissionEmailHandler : INotificationHandler<SubmitNotification> {
      private readonly EmailService _client;
      private readonly ILogger _log;

      public SendRegulatorySubmissionEmailHandler(EmailService client, ILogger log) {
        _client = client;
        _log = log;
      }

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

    public class SendAdminSubmissionEmailHandler : INotificationHandler<SubmitNotification> {
      private readonly EmailService _client;
      private readonly ILogger _log;
      public readonly string _email;

      public SendAdminSubmissionEmailHandler(EmailService client, IConfiguration configuration, ILogger log) {
        _client = client;
        _log = log;
        _email = configuration.GetSection("App")["AdminEmail"];
      }

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

    public class SendSubmissionRejectionEmailHandler : INotificationHandler<RejectNotification> {
      private readonly EmailService _client;
      private readonly ILogger _log;
      public readonly string _email;

      public SendSubmissionRejectionEmailHandler(EmailService client, IConfiguration configuration, ILogger log) {
        _client = client;
        _log = log;
        _email = configuration.GetSection("App")["AdminEmail"];
      }

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
          <p>If you have any questions please contact Brianna Ariotti at (801) 536-4351.</p>"
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

    public class RemoveCloudStorageHandler : INotificationHandler<RejectNotification> {
      private readonly ILogger _log;

      public RemoveCloudStorageHandler(ILogger log) {
        _log = log;
      }

      public async Task Handle(RejectNotification notification, CancellationToken token) {
        _log.ForContext("notification", notification)
          .Debug("Handling inventory rejection cloud storage removal");

        var client = await StorageClient.CreateAsync();
        // TODO: move this to config
        const string bucket = "ut-dts-agrc-uic-inventory-dev-documents";
        var success = true;
        try {
          await Task.WhenAll(notification.Files.Select(name => {
            if (string.IsNullOrEmpty(name)) {
              return Task.CompletedTask;
            }

            return client.DeleteObjectAsync(bucket, name.Replace("file::", string.Empty), cancellationToken: token);
          }));
        } catch (Exception ex) {
          success = false;

          _log.ForContext("notification", notification)
            .ForContext("exception", ex)
            .Error("Failed to remove inventory cloud storage files");
        }

        if (success) {
          _log.ForContext("notification", notification)
            .Debug("Removed inventory cloud storage files");
        }
      }
    }

    public class GroundWaterProtectionsHandler : INotificationHandler<SubmitNotification> {
      public record ProtectionResult(int WellId, string Service, bool Intersects);
      public record ProtectionQuery(int WellId, string Service, string Url);
      public record Protections(bool Aquifers, bool GroundWater);

      private const string _aquiferRechargeDistchargeAreas = "https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/Aquifer_RechargeDischargeAreas/FeatureServer/0";
      private const string _groundWaterFeatureServiceUrl = "https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Drinking_Water_Source_Protection_Zones_-_DDW/FeatureServer/2";
      private readonly HttpClient _client;
      private readonly IAppDbContext _context;
      private readonly ILogger _log;

      public GroundWaterProtectionsHandler(IHttpClientFactory clientFactory, IAppDbContext context, ILogger log) {
        _client = clientFactory.CreateClient("esri");
        _context = context;
        _log = log;
      }

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

          urls.Add(new ProtectionQuery(well.Id, "Aquifer Recharge/Discharge Areas", $"{_aquiferRechargeDistchargeAreas}/query?{queryString}"));
          urls.Add(new ProtectionQuery(well.Id, "Ground Water", $"{_groundWaterFeatureServiceUrl}/query?{queryString}"));
          queryResults[well.Id] = new List<ProtectionResult>();
        }

        var options = new JsonSerializerOptions {
          PropertyNameCaseInsensitive = true
        };

        await Task.WhenAll(urls.Select(async item => {
          using var response = await _client.GetAsync(item.Url, token);
          using var content = await response.Content.ReadAsStreamAsync(token);

          var queryResult = await JsonSerializer.DeserializeAsync<EsriQueryResponse>(content, options, cancellationToken: token);

          if (queryResult?.IsSuccessful != true) {
            _log.ForContext("queryResult", queryResult)
              .Error("Failed to query {id} for water protection intersections", item.WellId);

            return;
          }

          _log.Debug("Got {@queryResult} result for {wellId}", queryResult, item.WellId);

          queryResults[item.WellId].Add(new ProtectionResult(item.WellId, item.Service, queryResult?.Count > 0));
        }));

        foreach (var item in queryResults) {
          _log.Debug("Choosing code for {@item}", item);

          var has = new Protections(
            item.Value.Any(x => x.Service == "Aquifer Recharge/Discharge Areas" && x.Intersects),
            item.Value.Any(x => x.Service == "Ground Water" && x.Intersects)
          );

          var code = DetermineCode(has);

          var well = notification.Inventory.Wells.SingleOrDefault(x => x.Id == item.Key);

          if (well == null) {
            _log.Warning("Well {Id} not found in database. unable to update surface water protection", item.Key);
            continue;
          }

          well.SurfaceWaterProtection = code;
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
}
