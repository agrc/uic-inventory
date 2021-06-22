using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using HotChocolate;
using HotChocolate.Types;

namespace api.GraphQL {
  public class Notification {
    [GraphQLIgnore]
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string? Url { get; set; }
    [Column(TypeName = "jsonb")] public Dictionary<string, object>? AdditionalData { get; set; }
    public NotificationTypes? NotificationType { get; set; }
    public virtual ICollection<NotificationReceipt> NotificationReceipts { get; set; } = new HashSet<NotificationReceipt>();
  }

  public class NotificationReceipt {
    public int Id { get; set; }

    [GraphQLType(typeof(DateTimeType))] public DateTime? ReadAt { get; set; }

    [GraphQLType(typeof(DateTimeType))] public DateTime? DeletedAt { get; set; }

    public int RecipientId { get; set; }
    public int NotificationFk { get; set; }

    public virtual Notification Notification { get; set; } = default!;
    public virtual Account Recipient { get; set; } = default!;
  }

  public enum NotificationTypes {
    new_user_account_registration,
    facility_contact_modified,
  }

  public class NotificationInput {
    public int Id { get; set; }
    public bool? Read { get; set; }
    public bool? Deleted { get; set; }
  }

  public class NotificationPayload {
    public NotificationPayload() { }
    public NotificationPayload(Notification notification, NotificationReceipt receipt) {
      if (receipt.ReadAt.HasValue) {
        Read = true;
      }

      Id = receipt.Id;
      CreatedAt = notification.CreatedAt;
      ReadAt = receipt.ReadAt;
      NotificationType = notification.NotificationType ?? NotificationTypes.new_user_account_registration;
      Url = notification.Url ?? "#";
      AdditionalData = notification.AdditionalData ?? new Dictionary<string, object>();
      Deleted = receipt.DeletedAt.HasValue;

      foreach (var key in AdditionalData.Keys) {
        AdditionalData[key] = AdditionalData[key].ToString() ?? "null";
      }
    }

    public int Id { get; set; }
    [GraphQLName("event")] public NotificationTypes NotificationType { get; set; }
    [GraphQLType(typeof(DateTimeType))] public DateTime CreatedAt { get; set; }
    [GraphQLType(typeof(UrlType))] public string Url { get; set; }
    [GraphQLType(typeof(AnyType))] public IDictionary<string, object> AdditionalData { get; set; }
    [GraphQLType(typeof(DateTimeType))] public DateTime? ReadAt { get; set; }
    public bool Read { get; set; }
    public bool Deleted { get; set; }
  }
}
