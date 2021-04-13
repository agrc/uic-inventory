using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;

namespace api.GraphQL {
  public static class AccountInputExtension {
    public static Account UpdateAccount(this AccountInput input, Account account) {
      account.Organization = input.Organization;
      account.PhoneNumber = input.PhoneNumber;
      account.MailingAddress = input.MailingAddress;
      account.City = input.City;
      account.State = input.State;
      account.ZipCode = input.ZipCode;

      return account;
    }
  }

  public class AccountType : ObjectType<Account> {
    protected override void Configure(IObjectTypeDescriptor<Account> descriptor) => descriptor
        .Field(f => f.NotificationReceipt)
        .ResolveWith<NotificationResolver>(resolver => resolver.GetNotificationsAsync(default!, default!, default!, default))
        .UseDbContext<AppDbContext>()
        .Name("notifications");

    private class NotificationResolver {
      public async Task<IEnumerable<NotificationPayload>> GetNotificationsAsync(
        Account account,
        [ScopedService] AppDbContext context,
        NotificationByIdDataLoader notificationById,
        CancellationToken cancellationToken) {
        var notificationIds = await context.Accounts
          .Where(a => a.Id == account.Id)
          .Include(a => a.NotificationReceipt)
          .SelectMany(a => a.NotificationReceipt.Select(receipt => receipt.Id))
          .ToArrayAsync(cancellationToken: cancellationToken);

        return await notificationById.LoadAsync(notificationIds, cancellationToken);
      }
    }
  }
}
