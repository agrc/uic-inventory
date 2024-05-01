using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class GetInventoryById {
    public class Query(int siteId, int wellId) : IRequest<Inventory> {
        public int SiteId { get; init; } = siteId;
        public int InventoryId { get; } = wellId;
    }
    public class Handler(AppDbContext context, ILogger log) : IRequestHandler<Query, Inventory?> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        public async Task<Inventory?> Handle(Query message, CancellationToken cancellationToken) =>
          await _context.Inventories
            .Include(x => x.UnderReviewByAccount)
            .Include(x => x.ApprovedByAccount)
            .Include(x => x.AuthorizedByAccount)
            .Include(x => x.CompletedByAccount)
            .Include(x => x.Wells)
            .ThenInclude(x => x.WaterSystemContacts)
            .AsSplitQuery()
            .SingleOrDefaultAsync(x => x.Id == message.InventoryId, cancellationToken);
    }
}
public static class GetInventoriesBySite {
    public class Query(int siteId) : IRequest<IEnumerable<Inventory>> {
        public int SiteId { get; } = siteId;
    }

    public class Handler(AppDbContext context, ILogger log) : IRequestHandler<Query, IEnumerable<Inventory>> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        public async Task<IEnumerable<Inventory>> Handle(Query message, CancellationToken cancellationToken) =>
          await _context.Inventories.Where(x => x.SiteFk == message.SiteId).ToListAsync(cancellationToken);
    }
}
