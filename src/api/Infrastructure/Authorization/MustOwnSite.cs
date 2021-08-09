using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public class MustOwnSite : IAuthorizationRequirement {
    public MustOwnSite(int id) {
      SiteId = id;
    }
    public int SiteId { get; }

    private class Handler : IAuthorizationHandler<MustOwnSite> {
      private readonly ILogger _log;
      private readonly IAppDbContext _context;
      private readonly HasRequestMetadata _metadata;
      public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
        _context = context;
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustOwnSite requirement,
        CancellationToken token = default) {
        var site = await _context.Sites.SingleOrDefaultAsync(x => x.Id == requirement.SiteId, token);

        _metadata.Site = site;

        if (site is null) {
          return AuthorizationResult.Fail("site not found");
        }

        if (_metadata.Account.Id != site.AccountFk) {
          if (_metadata.Account.Access == AccessLevels.elevated) {
            _log.ForContext("siteId", requirement.SiteId)
                .ForContext("account", _metadata.Account)
                .Information("elevated access to external item");

            return AuthorizationResult.Succeed();
          }

          _log.ForContext("accessed by", _metadata.Account)
              .Warning("access to external item not permitted");

          return AuthorizationResult.Fail("account does not own requested resource");
        }

        return AuthorizationResult.Succeed();
      }
    }
  }
}
