using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using HotChocolate;
using HotChocolate.Types;

namespace api.GraphQL {
  public class Notification {
    [GraphQLIgnore()]
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string? Url { get; set; }
    [Column(TypeName = "jsonb")] public Dictionary<string, object>? AdditionalData { get; set; }
    public NotificationTypes? NotificationType { get; set; }
    public virtual ICollection<NotificationReceipt> NotificationReceipt { get; set; } = new List<NotificationReceipt>();
  }

  public partial class NotificationReceipt {
    public int Id { get; set; }

    [GraphQLType(typeof(DateTimeType))]
    public DateTime? ReadAt { get; set; }

    [GraphQLType(typeof(DateTimeType))]
    public DateTime? DeletedAt { get; set; }

    public int RecipientId { get; set; }
    public int NotificationFk { get; set; }

    public virtual Notification Notification { get; set; } = default!;
    public virtual Account Recipient { get; set; } = default!;
  }

  public enum NotificationTypes {
    new_user_account_registration,
    facility_contact_modified,
  }
}
