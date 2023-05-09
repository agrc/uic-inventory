using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features;
public static class AccountNotifications {
    public record AccountNotification : INotification {
        public Account Account { get; set; } = default!;
        public NotificationTypes Type { get; set; }
    }

    public record AdminAccountNotification : INotification {
        public Account Account { get; set; } = default!;
        public NotificationTypes Type { get; set; }
    }

    public class AccountCreationNotificationHandler : INotificationHandler<AccountNotification> {
        private readonly IAppDbContext _context;
        private readonly ILogger _log;

        public AccountCreationNotificationHandler(IAppDbContext context, ILogger log) {
            _context = context;
            _log = log;
        }
        public async Task Handle(AccountNotification notification, CancellationToken token) {
            _log.Information("Handling new account creation notification");

            var ids = _context.Accounts.Where(x => x.ReceiveNotifications == true).Select(x => x.Id);
            var recipients = new List<NotificationReceipt>();

            foreach (var id in ids) {
                recipients.Add(new NotificationReceipt {
                    RecipientId = id
                });
            }

            var item = new Notification {
                CreatedAt = DateTime.UtcNow,
                NotificationType = notification.Type,
                AdditionalData = new Dictionary<string, object> {
                    { "name", $"{notification.Account.FirstName} {notification.Account.LastName}" }
                },
                Url = $"/account/{notification.Account.Id}/profile",
                NotificationReceipts = recipients
            };

            await _context.Notifications.AddAsync(item, token);
            await _context.SaveChangesAsync(token);
        }
    }

    public class AdminCreationNotificationHandler : INotificationHandler<AdminAccountNotification> {
        private readonly IAppDbContext _context;
        private readonly ILogger _log;

        public AdminCreationNotificationHandler(IAppDbContext context, ILogger log) {
            _context = context;
            _log = log;
        }
        public async Task Handle(AdminAccountNotification notification, CancellationToken token) {
            _log.Information("Handling admin account promotion notification");

            var ids = _context.Accounts.Where(x => x.ReceiveNotifications == true).Select(x => x.Id);
            var recipients = new List<NotificationReceipt>();

            foreach (var id in ids) {
                recipients.Add(new NotificationReceipt {
                    RecipientId = id
                });
            }

            var item = new Notification {
                CreatedAt = DateTime.UtcNow,
                NotificationType = notification.Type,
                AdditionalData = new Dictionary<string, object> {
                    { "name", $"{notification.Account.FirstName} {notification.Account.LastName}" }
                },
                Url = $"/account/{notification.Account.Id}/profile",
                NotificationReceipts = recipients
            };

            await _context.Notifications.AddAsync(item, token);
            await _context.SaveChangesAsync(token);
        }
    }
}
