using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class GetNotifications {
    public class Query : IRequest<ProfileNotification> {
      public class Handler : IRequestHandler<Query, ProfileNotification> {
        private readonly ILogger _log;
        private readonly IAppDbContext _context;
        private readonly HasRequestMetadata _metadata;

        public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
          _context = context;
          _metadata = metadata;
          _log = log;
        }

        public async Task<ProfileNotification> Handle(Query request, CancellationToken token) {
          var items = await _context.NotificationReceipts
           .Include(x => x.Notification)
           .Where(x => x.RecipientId == _metadata.Account.Id)
           .Select(x => new NotificationPayload(x.Notification, x))
           .ToListAsync(token);

          return new ProfileNotification(_metadata.Account, items);
        }
      }
    }
  }
}
