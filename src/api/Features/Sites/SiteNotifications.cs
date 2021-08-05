using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;

namespace api.Features {
  public class SiteNotifications {
    public class SiteCreationNotification : INotification {

    }

    public class SiteCreationNotificationHandler : INotificationHandler<SiteCreationNotification> {
      public Task Handle(SiteCreationNotification notification, CancellationToken token) {
        throw new NotImplementedException();
      }
    }
  }
}
