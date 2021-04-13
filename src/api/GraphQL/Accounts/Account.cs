using System;
using System.Collections.Generic;
using HotChocolate;

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
    public Access Access { get; set; }
    [GraphQLIgnore()]
    public ICollection<NotificationReceipt>? NotificationReceipt { get; set; } = Array.Empty<NotificationReceipt>();
  }

  public enum Access {
    standard,
    elevated
  }
}
