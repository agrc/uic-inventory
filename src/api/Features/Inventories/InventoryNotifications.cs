using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using Serilog;

namespace api.Features {
  public static class InventoryNotifications {
    public static string LookupWellType(int type) => type switch {
      -1 => "General wells",
      5047 => "Storm water drainage wells",
      5002 => "Subsurface environmental remediation wells",
      5101 => "UIC - Regulated large underground wastewater disposal systems",
      5026 => "Veterinary, kennel, or pet grooming wastewater disposal systems",
      _ => "Unknown",
    };
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

    public class EditNotificationHandler : INotificationHandler<EditNotification> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;

      public EditNotificationHandler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
      private static bool GetWellContactStatus(Inventory entity) {
        foreach (var well in entity.Wells) {
          // if (well.)
        }

        return false;
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

        //! TODO: use admin url
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
          Url = $"/site/{notification.Site.Id}/inventory/{notification.Inventory.Id}/add-wells",
          NotificationReceipts = recipients
        };

        await _context.Notifications.AddAsync(item, token);
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
            <li>{LookupWellType(notification.Inventory.SubClass)} - Inventory #{notification.Inventory.Id} (Order #{notification.Inventory.OrderNumber})</li>
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
            <li>{LookupWellType(notification.Inventory.SubClass)} - Inventory #{notification.Inventory.Id} (Order #{notification.Inventory.OrderNumber})</li>
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
  }
}
