using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public class MustOwnWell : IAuthorizationRequirement {
    public MustOwnWell(int id) {
      WellId = id;
    }
    public int WellId { get; }

    private class Handler : IAuthorizationHandler<MustOwnWell> {
      private readonly ILogger _log;
      private readonly IAppDbContext _context;
      private readonly HasRequestMetadata _metadata;
      public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
        _context = context;
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustOwnWell requirement,
        CancellationToken token = default) {
        var well = await _context.Wells.SingleOrDefaultAsync(x => x.Id == requirement.WellId, token);

        if (well is null) {
          return AuthorizationResult.Fail("well not found");
        }

        if (_metadata.Account.Id != well.AccountFk) {
          if (_metadata.Account.Access == AccessLevels.elevated) {
            _log.ForContext("wellId", requirement.WellId)
                .ForContext("account", _metadata.Account)
                .Information("elevated access to external item");

            return AuthorizationResult.Succeed();
          }

          _log.ForContext("accessed by", _metadata.Account)
              .Warning("access to external item not permitted");

          return AuthorizationResult.Fail("W01:You cannot access items that you do not own.");
        }

        return AuthorizationResult.Succeed();
      }
    }
  }
}
