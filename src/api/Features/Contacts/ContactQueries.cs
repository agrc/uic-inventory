using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class GetSiteContacts {
    public class Query(int siteId) : IRequest<SiteContactPayload> {
        public int SiteId { get; } = siteId;

        public class Handler(
          AppDbContext context,
          HasRequestMetadata metadata,
          ILogger log) : IRequestHandler<Query, SiteContactPayload> {
            private readonly AppDbContext _context = context;
            private readonly HasRequestMetadata _metadata = metadata;
            private readonly ILogger _log = log;

            public async Task<SiteContactPayload> Handle(Query request, CancellationToken cancellationToken) {
                var site = await _context.Sites
                  .Include(x => x.Account)
                  .Include(x => x.Contacts)
                  .Where(site => site.Id == request.SiteId)
                  .FirstOrDefaultAsync(cancellationToken);

                var contacts = site?.Contacts
                  .Select(contact => new ContactPayload(contact))
                  .ToArray() ?? [];

                return new SiteContactPayload(site ?? new(), contacts);
            }
        }
    }
}
