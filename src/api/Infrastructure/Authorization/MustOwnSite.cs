using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustOwnSite(int id) : IAuthorizationRequirement {
    public int SiteId { get; } = id;

    private class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustOwnSite> {
        private readonly ILogger _log = log;
        private readonly AppDbContext _context = context;
        private readonly HasRequestMetadata _metadata = metadata;

        public async Task<AuthorizationResult> Handle(
          MustOwnSite requirement,
          CancellationToken token = default) {
            var site = await _context.Sites.SingleOrDefaultAsync(x => x.Id == requirement.SiteId, token);

            if (site is null) {
                _log.ForContext("site", site)
                    .ForContext("authorization", "MustOwnSite:S01")
                    .Warning("site not found");

                return AuthorizationResult.Fail("S01:You cannot access items that you do not own.");
            }

            _metadata.Site = site;

            if (_metadata.Account.Id != site.AccountFk) {
                if (_metadata.Account.Access == AccessLevels.elevated) {
                    _log.ForContext("siteId", requirement.SiteId)
                        .ForContext("account", _metadata.Account)
                        .ForContext("authorization", "MustOwnSite")
                        .Information("Elevated access to external item");

                    return AuthorizationResult.Succeed();
                }

                _log.ForContext("account", _metadata.Account)
                   .ForContext("authorization", "MustHaveInventoryStatus:S01")
                   .Warning("Access to external item not permitted");

                return AuthorizationResult.Fail("S01:You cannot access items that you do not own.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
