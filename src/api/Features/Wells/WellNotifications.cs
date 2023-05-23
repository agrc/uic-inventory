using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features;
public static class WellNotifications {
    // a notification created when a well is added to an approved inventory
    public record WellCreationNotification : INotification {
        public WellCreationNotification(Well well) {
            Well = well;

            Account = well.Account!;
            SiteId = well.SiteFk;
            Inventory = well.Inventory!;
        }

        public Account Account { get; }
        public int SiteId { get; }
        public Inventory Inventory { get; }
        public Well Well { get; }
        public NotificationTypes NotificationType { get; } = NotificationTypes.approved_inventory_well_addition;
    }
    public record WellStatusEditNotification : INotification {
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

    public class WellCreationNotificationHandler : INotificationHandler<WellCreationNotification> {
        private readonly IAppDbContext _context;
        private readonly ILogger _log;
        public WellCreationNotificationHandler(IAppDbContext context, ILogger log) {
            _context = context;
            _log = log;
        }

        private Notification CreateNotifications(WellCreationNotification metadata) {
            var notification = NotificationHelpers.CreateBasicNotification(_context, metadata.NotificationType);
            var initials = NotificationHelpers.GetInitials(metadata.Account);

            notification.AdditionalData = new Dictionary<string, object> {
                    { "name", initials },
                    { "inventoryId", metadata.Inventory.Id },
                };
            notification.Url = $"/site/{metadata.SiteId}/inventory/{metadata.Inventory.Id}/add-wells";

            return notification;
        }

        public async Task Handle(WellCreationNotification metadata, CancellationToken cancellationToken) {
            _log.ForContext("notification metadata", metadata)
              .Debug("Handling well creation notification");

            if (new List<InventoryStatus> { InventoryStatus.Incomplete, InventoryStatus.Complete }.Contains(metadata.Inventory.Status)) {
                _log.ForContext("notification", metadata)
                    .Debug("Inventory is not approved, skipping notification creation");

                return;
            }

            var notifications = CreateNotifications(metadata);

            _context.Notifications.Add(notifications);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
    public class WellStatusEditNotificationHandler : INotificationHandler<WellStatusEditNotification> {
        private readonly IAppDbContext _context;
        private readonly ILogger _log;

        public WellStatusEditNotificationHandler(IAppDbContext context, ILogger log) {
            _context = context;
            _log = log;
        }

        private Notification CreateNotifications(WellStatusEditNotification metadata) {
            var notification = NotificationHelpers.CreateBasicNotification(_context, metadata.NotificationType);
            var initials = NotificationHelpers.GetInitials(metadata.Account);

            notification.AdditionalData = new Dictionary<string, object> {
                    { "name", initials },
                    { "inventoryId", metadata.Inventory.Id },
                    { "oldStatus", WellLookup.OperatingStatus(metadata.OldStatus) },
                    { "newStatus", WellLookup.OperatingStatus(metadata.Well.Status) },
                };
            notification.Url = $"/site/{metadata.SiteId}/inventory/{metadata.Inventory.Id}/add-wells";

            return notification;
        }
        public async Task Handle(WellStatusEditNotification metadata, CancellationToken cancellationToken) {
            _log.ForContext("notification metadata", metadata)
              .Debug("Handling well status edit notification");

            if (new List<InventoryStatus> { InventoryStatus.Incomplete, InventoryStatus.Complete }.Contains(metadata.Inventory.Status)) {
                _log.ForContext("notification", metadata)
                    .Debug("Inventory is not approved, skipping notification creation");

                return;
            }

            var notifications = CreateNotifications(metadata);

            _context.Notifications.Add(notifications);

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
