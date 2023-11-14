using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace api.Features;
public static class GetSites {
    public class Query : IRequest<IReadOnlyCollection<SiteListPayload>> {
        public class Handler(
          AppDbContext context,
          HasRequestMetadata metadata) : IRequestHandler<Query, IReadOnlyCollection<SiteListPayload>> {
            private readonly AppDbContext _context = context;
            private readonly HasRequestMetadata _metadata = metadata;

            public async Task<IReadOnlyCollection<SiteListPayload>> Handle(Query request, CancellationToken token) {
                var query = _context.Sites.AsQueryable();

                if (_metadata.Account.Access != AccessLevels.elevated) {
                    query = query.Where(s => s.AccountFk == _metadata.Account.Id);
                }

                return await query
                  .Select(site => new SiteListPayload(site))
                  .ToListAsync(token);
            }
        }
    }
}
public static class GetSiteById {
    public class Query(int id) : IRequest<SitePayload> {
        public int SiteId { get; } = id;
        public class Handler(
          AppDbContext context) : IRequestHandler<Query, SitePayload> {
            private readonly AppDbContext _context = context;

            public async Task<SitePayload> Handle(Query request, CancellationToken token) {
                var site = await _context.Sites.SingleOrDefaultAsync(x => x.Id == request.SiteId, token) ?? new();

                return new SitePayload(site);
            }
        }
    }
}
