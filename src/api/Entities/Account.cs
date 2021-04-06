using HotChocolate;
using HotChocolate.Types;

namespace api.Entities {
  public class Account {
    [GraphQLIgnore()]
    public int Id { get; set; }
    public string UtahId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Organization { get; set; }
    [GraphQLType(typeof(EmailAddressType))]
    public string Email { get; set; }
    [GraphQLType(typeof(PhoneNumberType))]
    public string PhoneNumber { get; set; }
    public string MailingAddress { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    [GraphQLType(typeof(PostalCodeType))]
    public string ZipCode { get; set; }
    [GraphQLIgnore()]
    public bool ReceiveNotifications { get; set; }
    [GraphQLIgnore()]
    public Access Access { get; set; }
  }

  public enum Access {
    standard,
    elevated
  }
}
