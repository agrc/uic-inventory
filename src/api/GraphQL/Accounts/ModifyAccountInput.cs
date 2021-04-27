using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Types;

namespace api.GraphQL {
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
    [Authorize] public Access? Access { get; set; }
  }
}
