using System;
using System.Collections.Generic;
using MediatR.Behaviors.Authorization.Exceptions;

namespace api.Features;
public class Contact {
    public int Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Organization { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MailingAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public ContactTypes ContactType { get; set; }
    public int SiteFk { get; set; }
    public Site? Site { get; set; }
    public bool SerContact { get; set; }
}

public enum ContactTypes {
    owner_operator,
    facility_owner,
    facility_operator,
    facility_manager,
    legal_rep,
    official_rep,
    contractor,
    project_manager,
    health_dept,
    permit_writer,
    developer,
    other,
}

public class ContactInput {
    public int AccountId { get; set; }
    public int SiteId { get; set; }
    public int ContactId { get; set; }
    public string? Organization { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MailingAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public ContactTypes? ContactType { get; set; }
    public bool SerContact { get; set; }
}

public static class ContactInputExtension {
    public static Contact Update(this ContactInput input, Contact output) {
        output.SiteFk = input.SiteId;

        if (input.FirstName != null) {
            output.FirstName = input.FirstName;
        }

        if (input.LastName != null) {
            output.LastName = input.LastName;
        }

        if (input.Email != null) {
            output.Email = input.Email;
        }

        if (input.Organization != null) {
            output.Organization = input.Organization;
        }

        if (input.PhoneNumber != null) {
            output.PhoneNumber = input.PhoneNumber;
        }

        if (input.MailingAddress != null) {
            output.MailingAddress = input.MailingAddress;
        }

        if (input.City != null) {
            output.City = input.City;
        }

        if (input.State != null) {
            output.State = input.State;
        }

        if (input.ZipCode != null) {
            output.ZipCode = input.ZipCode;
        }

        if (input.ContactType != null) {
            output.ContactType = input.ContactType.Value;
        }

        if (input.SerContact != default) {
            output.SerContact = input.SerContact;
        }

        return output;
    }
}

public class ContactPayload : ResponseContract {
    public ContactPayload(UnauthorizedException error) : base(error.Message) { }
    public ContactPayload(Exception _) : base("WTF01:Something went terribly wrong that we did not expect.") { }

    public ContactPayload(Contact contact) {
        Id = contact.Id;
        FirstName = contact.FirstName;
        LastName = contact.LastName;
        Organization = contact.Organization;
        Email = contact.Email;
        PhoneNumber = contact.PhoneNumber;
        MailingAddress = contact.MailingAddress;
        City = contact.City;
        State = contact.State;
        ZipCode = contact.ZipCode;
        ContactType = contact.ContactType;
    }

    public int Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Organization { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? MailingAddress { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public ContactTypes ContactType { get; set; }
}

public class SiteContactPayload : ResponseContract {
    public SiteContactPayload(UnauthorizedException error) : base(error.Message) {
        Name = "unknown";
        SiteId = "unknown";
        NaicsTitle = "unknown";
        Contacts = Array.Empty<ContactPayload>();
        Owner = new AccountPayload(new Account());
    }
    public SiteContactPayload(Exception _) : base("WTF01:Something went terribly wrong that we did not expect.") {
        Name = "unknown";
        SiteId = "unknown";
        NaicsTitle = "unknown";
        Contacts = Array.Empty<ContactPayload>();
        Owner = new AccountPayload(new Account());
    }
    public SiteContactPayload(Site site, IReadOnlyCollection<ContactPayload> contacts) {
        Name = site.Name ?? "unknown";
        SiteId = site.SiteId ?? "unknown";
        NaicsTitle = site.NaicsTitle ?? "unknown";
        Owner = new AccountPayload(site.Account);
        Contacts = contacts;
    }

    public string Name { get; set; }
    public string NaicsTitle { get; set; }
    public string SiteId { get; set; }
    public AccountPayload Owner { get; set; }
    public IReadOnlyCollection<ContactPayload> Contacts { get; }
}
