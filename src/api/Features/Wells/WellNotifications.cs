using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features;
public static class WellNotifications {
    public class WellStatusEditNotification : INotification {
        public WellStatusEditNotification(Well well, string oldStatus) {
            Well = well;
            OldStatus = oldStatus;

            Account = well.Account!;
            SiteId = well.SiteFk;
            Inventory = well.Inventory!;
        }

        public Account Account { get; }
        public int SiteId { get; }
        public Inventory Inventory { get; }
        public Well Well { get; }
        public string OldStatus { get; }
        public NotificationTypes NotificationType { get; } = NotificationTypes.approved_well_status_edit;
    }

    public class WellStatusEditNotificationHandler : INotificationHandler<WellStatusEditNotification> {
        private readonly IAppDbContext _context;
        private readonly ILogger _log;

        public WellStatusEditNotificationHandler(IAppDbContext context, ILogger log) {
            _context = context;
            _log = log;
        }

        private Notification CreateNotifications(WellStatusEditNotification notification) {
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

            return new Notification {
                CreatedAt = DateTime.UtcNow,
                NotificationType = notification.NotificationType,
                AdditionalData = new Dictionary<string, object> {
                    { "name", initials },
                    { "inventoryId", notification.Inventory.Id },
                    { "oldStatus", WellLookup.OperatingStatus(notification.OldStatus) },
                    { "newStatus", WellLookup.OperatingStatus(notification.Well.Status) },
                },
                Url = $"/site/{notification.SiteId}/inventory/{notification.Inventory.Id}/add-wells",
                NotificationReceipts = recipients
            };
        }
        public async Task Handle(WellStatusEditNotification notification, CancellationToken cancellationToken) {
            _log.ForContext("notification", notification)
              .Debug("Handling well status edit notification");

            if (new List<InventoryStatus> { InventoryStatus.Incomplete, InventoryStatus.Complete }.Contains(notification.Inventory.Status)) {
                _log.ForContext("notification", notification)
                    .Debug("Inventory is not approved, skipping notification creation");

                return;
            }

            var item = CreateNotifications(notification);

            _context.Notifications.Add(item);

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
