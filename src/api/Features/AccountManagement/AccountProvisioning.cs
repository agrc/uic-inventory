using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.GraphQL;
using api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace api.Features.AccountManagement {
  public class AccountProvisioning {
    public class Computation : IComputation<Task> {
      public Account Account { get; } = new ();

      public Computation(IEnumerable<Claim> claims) {
        foreach (var claim in claims) {
          switch (claim.Type.Split('/').Last()) {
            case "nameidentifier":
              Account.UtahId = claim.Value;
              break;
            case "givenname":
              Account.FirstName = claim.Value;
              break;
            case "surname":
              Account.LastName = claim.Value;
              break;
            case "emailaddress":
              Account.Email = claim.Value;
              break;
          }
        }
      }
    }

    public class Handler : IComputationHandler<Computation, Task> {
      private readonly AppDbContext _context;

      public Handler(AppDbContext context) {
        _context = context;
      }

      public async Task<Task> Handle(Computation computation, CancellationToken cancellationToken) {
        var account = await _context.Accounts.SingleOrDefaultAsync(x => x.UtahId == computation.Account.UtahId, cancellationToken);

        if (account is not null) {
          return Task.FromResult(Task.CompletedTask);
        }

        await _context.Accounts.AddAsync(computation.Account, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var notification = CreateNotification(NotificationTypes.new_user_account_registration, computation.Account);

        await _context.Notifications.AddAsync(notification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Task.FromResult(Task.CompletedTask);
      }

      private Notification CreateNotification(NotificationTypes type, Account account) {
        var ids = _context.Accounts.Where(x => x.ReceiveNotifications == true).Select(x => x.Id);
        var recipients = new List<NotificationReceipt>();

        foreach (var id in ids) {
          recipients.Add(new NotificationReceipt {
            RecipientId = id
          });
        }

        return new Notification {
          CreatedAt = DateTime.Now,
          NotificationType = type,
          AdditionalData = new Dictionary<string, object> {
            { "name", $"{account.FirstName} {account.LastName}" }
          },
          Url = $"/account/{account.Id}/profile",
          NotificationReceipt = recipients
        };
      }
    }
  }
}
