using System;
using System.Collections.Generic;
using HotChocolate;
using HotChocolate.Types;

namespace api.GraphQL {
  public class NotificationPayload {
    public NotificationPayload(Notification notification, NotificationReceipt receipt) {
      if (receipt.ReadAt.HasValue) {
        Read = true;
      }

      Id = receipt.Id;
      CreatedAt = notification.CreatedAt;
      NotificationType = notification.NotificationType ?? NotificationTypes.new_user_account_registration;
      Url = notification.Url ?? "#";
      AdditionalData = notification.AdditionalData ?? new Dictionary<string, object>();
    }

    public int Id { get; }
    public bool Read { get; }
    [GraphQLType(typeof(DateTimeType))] public DateTime? ReadAt { get; }
    [GraphQLName("event")] public NotificationTypes NotificationType { get; }
    [GraphQLType(typeof(DateTimeType))] public DateTime CreatedAt { get; }
    [GraphQLType(typeof(UrlType))] public string Url { get; }
    public Dictionary<string, object> AdditionalData { get; }
  }
}
