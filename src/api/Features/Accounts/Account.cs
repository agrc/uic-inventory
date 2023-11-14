using System;
using System.Collections.Generic;
using MediatR.Behaviors.Authorization.Exceptions;

namespace api.Features;
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
    public ICollection<Site> Sites { get; set; } = new HashSet<Site>();
    public ICollection<Well> Wells { get; set; } = new HashSet<Well>();
    public ICollection<Inventory> Inventories { get; set; } = new HashSet<Inventory>();

    internal void Delete() {
        // set every property to null except the id
        FirstName = "account";
        LastName = "deleted";
        Organization = null;
        Email = null;
        PhoneNumber = null;
        MailingAddress = null;
        City = null;
        State = null;
        ZipCode = null;
        ReceiveNotifications = false;
        ProfileComplete = false;
        Access = AccessLevels.standard;
    }
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

        return account;
    }
}
public class AdminAccountInput {
    public int Id { get; set; }
    public bool? ReceiveNotifications { get; set; }
    public AccessLevels? Access { get; set; }
}

public static class AdminAccountInputExtension {
    public static Account UpdateAccount(this AdminAccountInput input, Account account) {
        if (input.Access.HasValue) {
            account.Access = input.Access.Value;
        }

        if (input.ReceiveNotifications != null) {
            account.ReceiveNotifications = input.ReceiveNotifications;
        }

        if (account.Access == AccessLevels.standard) {
            account.ReceiveNotifications = false;
        }

        return account;
    }
}

public class AccountPayload : ResponseContract {
    public AccountPayload(UnauthorizedAccessException _) : base("A01:You are not allowed to access this resource.") { }
    public AccountPayload(UnauthorizedException error) : base(error.Message) { }
    public AccountPayload(Exception _) : base("WTF01:Something went terribly wrong that we did not expect.") { }

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

public class AuthPayload : ResponseContract {
    public AuthPayload(UnauthorizedAccessException error) : base(error.Message) {
        UserData = new Extra(new());
    }
    public AuthPayload(Exception _) : base("WTF01:Something went terribly wrong that we did not expect.") {
        UserData = new Extra(new());
    }

    public AuthPayload(Account account) {
        Id = account.Id;
        UserData = new Extra(account);
    }
    public class Extra(Account account) {
        public string FirstName { get; set; } = account.FirstName ?? "";
        public string LastName { get; set; } = account.LastName ?? "";
        public AccessLevels Access { get; set; } = account.Access;
        public bool ReceiveNotifications { get; set; } = account.ReceiveNotifications ?? false;
        public bool ProfileComplete { get; set; } = account.ProfileComplete;
    }

    public int Id { get; set; }
    public Extra UserData { get; set; }
}

public class MinimalAccountPayload : ResponseContract {
    public MinimalAccountPayload(UnauthorizedAccessException _) : base("A01:You are not allowed to access this resource.") {
        Accounts = [];
    }
    public MinimalAccountPayload(UnauthorizedException error) : base(error.Message) {
        Accounts = [];
    }
    public MinimalAccountPayload(Exception _) : base("WTF01:Something went terribly wrong that we did not expect.") {
        Accounts = [];
    }
    public record MinimalAccount(int Id, string FirstName, string LastName, string Email, AccessLevels Access);
    public IList<MinimalAccount> Accounts { get; set; }
    public MinimalAccountPayload(IEnumerable<Account> input) {
        Accounts = new List<MinimalAccount>();

        foreach (var account in input) {
            Accounts.Add(new MinimalAccount(account.Id, account?.FirstName ?? "Unknown", account?.LastName ?? "Unknown", account?.Email ?? "Unknown", account?.Access ?? AccessLevels.standard));
        }
    }
}
