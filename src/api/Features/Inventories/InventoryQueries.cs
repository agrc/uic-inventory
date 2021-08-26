using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class GetInventoryById {
    public class Query : IRequest<Inventory> {
      public Query(int siteId, int wellId) {
        SiteId = siteId;
        InventoryId = wellId;
      }

      public int SiteId { get; init; }
      public int InventoryId { get; }
    }
    public class Handler : IRequestHandler<Query, Inventory> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;

      public Handler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
      public async Task<Inventory> Handle(Query message, CancellationToken cancellationToken) {
        var result = await _context.Inventories
          .Include(x => x.Wells)
          .SingleOrDefaultAsync(x => x.Id == message.InventoryId, cancellationToken) ?? new();

        return result;
      }
    }
  }
}
