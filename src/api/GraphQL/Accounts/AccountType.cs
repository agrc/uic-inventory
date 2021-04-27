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
      if (input.FirstName != null) {
        account.FirstName = input.FirstName;
      }

      if (input.LastName != null) {
        account.LastName = input.LastName;
      }

      if (input.Email != null) {
        account.Email = input.Email;
      }

      if (input.Organization != null) {
        account.Organization = input.Organization;
      }

      if (input.PhoneNumber != null) {
        account.PhoneNumber = input.PhoneNumber;
      }

      if (input.MailingAddress != null) {
        account.MailingAddress = input.MailingAddress;
      }

      if (input.City != null) {
        account.City = input.City;
      }

      if (input.State != null) {
        account.State = input.State;
      }

      if (input.ZipCode != null) {
        account.ZipCode = input.ZipCode;
      }

      if (input.ReceiveNotifications != null) {
        account.ReceiveNotifications = input.ReceiveNotifications;
      }

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
