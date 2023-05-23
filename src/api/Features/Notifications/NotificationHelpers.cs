using System;
using System.Collections.Generic;
using System.Linq;
using api.Infrastructure;

namespace api.Features;

public static class NotificationHelpers {
    public static Notification CreateBasicNotification(IAppDbContext context, NotificationTypes notificationType) {
        var ids = context.Accounts.Where(x => x.ReceiveNotifications == true).Select(x => x.Id);
        var recipients = new List<NotificationReceipt>();

        foreach (var id in ids) {
            recipients.Add(new NotificationReceipt {
                RecipientId = id
            });
        }

        return new Notification {
            CreatedAt = DateTime.UtcNow,
            NotificationType = notificationType,
            NotificationReceipts = recipients
        };
    }

    public static string GetInitials(Account? account) {
        var initials = "ID";
        if (account?.FirstName != null && account?.LastName != null) {
            initials = string.Concat(account.FirstName.AsSpan(0, 1), account.LastName.AsSpan(0, 1));
        }

        return initials;
    }
}
