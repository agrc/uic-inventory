using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustOwnWell(int id) : IAuthorizationRequirement {
    public int WellId { get; } = id;

    private class Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustOwnWell> {
        private readonly ILogger _log = log;
        private readonly IAppDbContext _context = context;
        private readonly HasRequestMetadata _metadata = metadata;

        public async Task<AuthorizationResult> Handle(
          MustOwnWell requirement,
          CancellationToken token = default) {
            var well = await _context.Wells.SingleOrDefaultAsync(x => x.Id == requirement.WellId, token);

            if (well is null) {
                return AuthorizationResult.Fail("W01:You cannot access items that you do not own.");
            }

            if (_metadata.Account.Id != well.AccountFk) {
                if (_metadata.Account.Access == AccessLevels.elevated) {
                    _log.ForContext("wellId", requirement.WellId)
                        .ForContext("account", _metadata.Account)
                        .Information("Elevated access to external item");

                    return AuthorizationResult.Succeed();
                }

                _log.ForContext("accessed by", _metadata.Account)
                    .Warning("Access to external item not permitted");

                return AuthorizationResult.Fail("W01:You cannot access items that you do not own.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
