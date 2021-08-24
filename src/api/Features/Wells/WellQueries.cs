using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class GetWellById {
    public class Query : IRequest<Well> {
      public Query(int siteId, int wellId) {
        SiteId = siteId;
        WellId = wellId;
      }

      public int SiteId { get; init; }
      public int WellId { get; }
    }
    public class Handler : IRequestHandler<Query, Well> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;

      public Handler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
      public async Task<Well> Handle(Query message, CancellationToken cancellationToken) {
        var result = await _context.Wells.SingleOrDefaultAsync(x => x.Id == message.WellId, cancellationToken) ?? new();

        return result;
      }
    }
  }
}
