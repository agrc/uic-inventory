using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class ContactNotifications {
    public record AddContactNotification : INotification {
        public AddContactNotification(int siteId, int accountId) {
            SiteId = siteId;
            AccountId = accountId;
        }

        public int SiteId { get; }
        public int AccountId { get; set; }
        public NotificationTypes NotificationType { get; } = NotificationTypes.approved_site_contact_addition;
    }
    public record DeleteContactNotification : INotification {
        public DeleteContactNotification(int siteId, int accountId) {
            SiteId = siteId;
            AccountId = accountId;
        }

        public int SiteId { get; }
        public int AccountId { get; set; }
        public NotificationTypes NotificationType { get; } = NotificationTypes.approved_site_contact_deletion;
    }

    public class ContactDeletedNotificationHandler(AppDbContext context, ILogger log) : INotificationHandler<DeleteContactNotification> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        private Notification CreateNotifications(DeleteContactNotification metadata, Account? account) {
            var notification = NotificationHelpers.CreateBasicNotification(_context, metadata.NotificationType);
            var initials = NotificationHelpers.GetInitials(account);

            notification.AdditionalData = new Dictionary<string, object> {
                    { "name", initials },
                    { "siteId", metadata.SiteId },
                };
            notification.Url = $"/site/{metadata.SiteId}/add-contacts";

            return notification;
        }

        public async Task Handle(DeleteContactNotification metadata, CancellationToken cancellationToken) {
            _log.ForContext("notification metadata", metadata)
              .Debug("Handling site contact deletion notification");

            var site = await _context.Sites
                .Include(i => i.Inventories)
                .FirstOrDefaultAsync(s => s.Id == metadata.SiteId, cancellationToken);

            if (site is null) {
                _log.ForContext("notification", metadata)
                    .Debug("Site not found, skipping notification creation");

                return;
            }

            if (site.Status == SiteStatus.Incomplete) {
                _log.ForContext("notification", metadata)
                    .Debug("Site is not complete, skipping notification creation");

                return;
            }

            var hasApprovedInventory = site.Inventories.Any(i => i.Status == InventoryStatus.Authorized);

            if (!hasApprovedInventory) {
                _log.ForContext("notification", metadata)
                    .Debug("Site has no approved inventories, skipping notification creation");

                return;
            }

            var account = await _context.Accounts
                .FirstAsync(s => s.Id == metadata.AccountId, cancellationToken);

            var notifications = CreateNotifications(metadata, account);

            _context.Notifications.Add(notifications);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
    public class ContactAddedNotificationHandler(AppDbContext context, ILogger log) : INotificationHandler<AddContactNotification> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        private Notification CreateNotifications(AddContactNotification metadata, Account? account) {
            var notification = NotificationHelpers.CreateBasicNotification(_context, metadata.NotificationType);
            var initials = NotificationHelpers.GetInitials(account);

            notification.AdditionalData = new Dictionary<string, object> {
                    { "name", initials },
                    { "siteId", metadata.SiteId },
                };
            notification.Url = $"/site/{metadata.SiteId}/add-contacts";

            return notification;
        }

        public async Task Handle(AddContactNotification metadata, CancellationToken cancellationToken) {
            _log.ForContext("notification metadata", metadata)
              .Debug("Handling site contact creation notification");

            var site = await _context.Sites
                .Include(i => i.Inventories)
                .FirstAsync(s => s.Id == metadata.SiteId, cancellationToken);

            if (site is null) {
                _log.ForContext("notification", metadata)
                    .Debug("Site not found, skipping notification creation");

                return;
            }

            if (site.Status == SiteStatus.Incomplete) {
                _log.ForContext("notification", metadata)
                    .Debug("Site is not complete, skipping notification creation");

                return;
            }

            var hasApprovedInventory = site.Inventories.Any(i => i.Status == InventoryStatus.Authorized);

            if (!hasApprovedInventory) {
                _log.ForContext("notification", metadata)
                    .Debug("Site has no approved inventories, skipping notification creation");

                return;
            }

            var account = await _context.Accounts
               .FirstAsync(s => s.Id == metadata.AccountId, cancellationToken);

            var notifications = CreateNotifications(metadata, account);

            _context.Notifications.Add(notifications);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
