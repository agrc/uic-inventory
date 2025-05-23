using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features;
public static class AccountNotifications {
    public record AccountNotification : INotification {
        public Account Account { get; set; } = default!;
        public NotificationTypes NotificationType { get; set; }
    }
    public record AdminAccountNotification : INotification {
        public Account Account { get; set; } = default!;
        public NotificationTypes NotificationType { get; set; }
    }

    public class AccountCreationNotificationHandler(AppDbContext context, ILogger log) : INotificationHandler<AccountNotification> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        private Notification CreateNotifications(AccountNotification metadata) {
            var notification = NotificationHelpers.CreateBasicNotification(_context, metadata.NotificationType);

            notification.AdditionalData = new Dictionary<string, object> {
                    { "name", $"{metadata.Account.FirstName} {metadata.Account.LastName}" }
                };
            notification.Url = $"/account/{metadata.Account.Id}/profile";

            return notification;
        }
        public async Task Handle(AccountNotification metadata, CancellationToken token) {
            _log.ForContext("notification metadata", metadata)
                .Information("Handling new account creation notification");

            var notifications = CreateNotifications(metadata);

            _context.Notifications.Add(notifications);
            await _context.SaveChangesAsync(token);
        }
    }

    public class AdminCreationNotificationHandler(AppDbContext context, ILogger log) : INotificationHandler<AdminAccountNotification> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        private Notification CreateNotifications(AdminAccountNotification metadata) {
            var notification = NotificationHelpers.CreateBasicNotification(_context, metadata.NotificationType);

            notification.AdditionalData = new Dictionary<string, object> {
                    { "name", $"{metadata.Account.FirstName} {metadata.Account.LastName}" }
                };
            notification.Url = $"/account/{metadata.Account.Id}/profile";

            return notification;
        }
        public async Task Handle(AdminAccountNotification metadata, CancellationToken token) {
            _log.ForContext("notification metadata", metadata)
                .Information("Handling admin account promotion notification");

            var notifications = CreateNotifications(metadata);

            _context.Notifications.Add(notifications);
            await _context.SaveChangesAsync(token);
        }
    }
}
