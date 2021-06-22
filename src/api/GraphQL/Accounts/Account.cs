using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;

namespace api.GraphQL {
  public class Account {
    public int Id { get; set; }
    public string? UtahId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Organization { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MailingAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public bool? ReceiveNotifications { get; set; }
    public bool ProfileComplete { get; set; }
    public AccessLevels Access { get; set; }
    [GraphQLIgnore]
    public ICollection<NotificationReceipt>? NotificationReceipts { get; set; } = new HashSet<NotificationReceipt>();
    public ICollection<Site>? Sites { get; set; } = new HashSet<Site>();
  }

  public enum AccessLevels {
    standard,
    elevated
  }

  public class AccountType : ObjectType<Account> {
    protected override void Configure(IObjectTypeDescriptor<Account> descriptor) => descriptor
        .Field(f => f.NotificationReceipts)
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
          .Include(a => a.NotificationReceipts)
          .SelectMany(a => a.NotificationReceipts.Select(receipt => receipt.Id))
          .ToArrayAsync(cancellationToken: cancellationToken);

        return await notificationById.LoadAsync(notificationIds, cancellationToken);
      }
    }
  }

  public class AccountInput {
    public int Id { get; set; }
    public string? Organization { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    [GraphQLType(typeof(EmailAddressType))] public string? Email { get; set; }
    [GraphQLType(typeof(PhoneNumberType))] public string? PhoneNumber { get; set; }
    public string? MailingAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    [GraphQLType(typeof(PostalCodeType))] public string? ZipCode { get; set; }
    [Authorize] public bool? ReceiveNotifications { get; set; }
    [Authorize] public AccessLevels? Access { get; set; }
  }

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

  public class AccountPayload {
    public AccountPayload(Account account) {
      Account = account;
    }

    public Account Account { get; }
  }
}
