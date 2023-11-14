using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class GetWellById {
    public class Query(int siteId, int inventoryId, int wellId) : IRequest<Well> {
        public int SiteId { get; } = siteId;
        public int WellId { get; } = wellId;
        public int InventoryId { get; } = inventoryId;
    }
    public class Handler(AppDbContext context, ILogger log) : IRequestHandler<Query, Well> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        public async Task<Well> Handle(Query message, CancellationToken cancellationToken) {
            var result = await _context.Wells.SingleOrDefaultAsync(x => x.Id == message.WellId, cancellationToken) ?? new();

            return result;
        }
    }
}
