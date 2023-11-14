using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class GetNotifications {
    public class Query : IRequest<ProfileNotificationPayload> {
        public class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IRequestHandler<Query, ProfileNotificationPayload> {
            private readonly ILogger _log = log;
            private readonly AppDbContext _context = context;
            private readonly HasRequestMetadata _metadata = metadata;

            public async Task<ProfileNotificationPayload> Handle(Query request, CancellationToken token) {
                var items = await _context.NotificationReceipts
                 .Include(x => x.Notification)
                 .Where(x => x.RecipientId == _metadata.Account.Id)
                 .Select(x => new NotificationPayload(x.Notification, x))
                 .ToListAsync(token);

                return new ProfileNotificationPayload(_metadata.Account, items);
            }
        }
    }
}
