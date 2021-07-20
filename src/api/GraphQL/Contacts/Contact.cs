namespace api.GraphQL {
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
    public Site? Site { get; set; } = default!;
  }

  public enum ContactTypes {
    owner_operator,
    facility_owner,
    facility_operator,
    facility_manager,
    legal_rep,
    official_rep,
    contractor,
    health_dept,
    permit_writer,
    developer,
    other,
    project_manager
  }

  public class ContactInput {
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
    public ContactTypes? ContactType { get; set; }
  }

  public static class ContactInputExtension {
    public static Contact Update(this ContactInput input, Contact output) {
      output.SiteFk = input.Id;

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

      return output;
    }
  }

  public class ContactPayload {
    public ContactPayload(Contact contact) {
      Contact = contact;
    }

    public Contact Contact { get; }
  }
}
