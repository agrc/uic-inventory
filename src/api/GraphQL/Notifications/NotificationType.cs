using System;
using System.Collections.Generic;
using HotChocolate;
using HotChocolate.Types;

namespace api.GraphQL {
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
