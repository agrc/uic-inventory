using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class GetSiteContacts {
    public class Query : IRequest<SiteContactPayload> {
        public Query(int siteId) {
            SiteId = siteId;
        }

        public int SiteId { get; }

        public class Handler : IRequestHandler<Query, SiteContactPayload> {
            private readonly IAppDbContext _context;
            private readonly HasRequestMetadata _metadata;
            private readonly ILogger _log;

            public Handler(
              IAppDbContext context,
              HasRequestMetadata metadata,
              ILogger log) {
                _context = context;
                _metadata = metadata;
                _log = log;
            }

            public async Task<SiteContactPayload> Handle(Query request, CancellationToken cancellationToken) {
                var site = await _context.Sites
                  .Include(x => x.Account)
                  .Include(x => x.Contacts)
                  .Where(site => site.Id == request.SiteId)
                  .FirstOrDefaultAsync(cancellationToken);

                var contacts = site?.Contacts
                  .Select(contact => new ContactPayload(contact))
                  .ToArray() ?? Array.Empty<ContactPayload>();

                return new SiteContactPayload(site ?? new(), contacts);
            }
        }
    }
}
