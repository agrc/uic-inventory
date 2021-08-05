using System.Collections.Generic;

namespace api.Features {
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
    public ICollection<NotificationReceipt>? NotificationReceipts { get; set; } = new HashSet<NotificationReceipt>();
    public ICollection<Site>? Sites { get; set; } = new HashSet<Site>();
  }

  public enum AccessLevels {
    standard,
    elevated
  }

  public class AccountInput {
    public int Id { get; set; }
    public string? Organization { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MailingAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public bool? ReceiveNotifications { get; set; }
    public AccessLevels? Access { get; set; }
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
    public AccountPayload(Account? input) {
      input ??= new Account();

      if (input.FirstName != null) {
        FirstName = input.FirstName;
      }

      if (input.LastName != null) {
        LastName = input.LastName;
      }

      if (input.Email != null) {
        Email = input.Email;
      }

      if (input.Organization != null) {
        Organization = input.Organization;
      }

      if (input.PhoneNumber != null) {
        PhoneNumber = input.PhoneNumber;
      }

      if (input.MailingAddress != null) {
        MailingAddress = input.MailingAddress;
      }

      if (input.City != null) {
        City = input.City;
      }

      if (input.State != null) {
        State = input.State;
      }

      if (input.ZipCode != null) {
        ZipCode = input.ZipCode;
      }

      if (input.ReceiveNotifications != null) {
        ReceiveNotifications = input.ReceiveNotifications;
      }

      Access = input.Access;
    }

    public int Id { get; set; }
    public string? Organization { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MailingAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public bool? ReceiveNotifications { get; set; }
    public AccessLevels? Access { get; set; }
  }

  public class AuthPayload {
    public class Extra {
      public Extra(Account account) {
        FirstName = account.FirstName ?? "";
        LastName = account.LastName ?? "";
        Access = account.Access;
        ReceiveNotifications = account.ReceiveNotifications ?? false;
        ProfileComplete = account.ProfileComplete;
      }
      public string FirstName { get; set; }
      public string LastName { get; set; }
      public AccessLevels Access { get; set; }
      public bool ReceiveNotifications { get; set; }
      public bool ProfileComplete { get; set; }
    }
    public AuthPayload(Account account) {
      Id = account.Id;
      UserData = new Extra(account);
    }

    public int Id { get; set; }
    public Extra UserData { get; set; }
  }
}
