using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustOwnAccount(int id) : IAuthorizationRequirement {
    public int AccountId { get; } = id;

    private class Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustOwnAccount> {
        private readonly ILogger _log = log;
        private readonly IAppDbContext _context = context;
        private readonly HasRequestMetadata _metadata = metadata;

        public async Task<AuthorizationResult> Handle(
          MustOwnAccount requirement,
          CancellationToken token = default) {
            var account = await _context.Accounts.SingleOrDefaultAsync(x => x.Id == requirement.AccountId, token) ?? new();

            if (_metadata.Account.Id != requirement.AccountId) {
                if (_metadata.Account.Access == AccessLevels.elevated) {
                    _log.ForContext("accountId", requirement.AccountId)
                        .ForContext("account", account)
                        .Information("Elevated access to external item");

                    return AuthorizationResult.Succeed();
                }

                _log.ForContext("accessed account", account)
                    .ForContext("accessed by", _metadata.Account)
                    .Warning("Access to external item not permitted");

                return AuthorizationResult.Fail("A04:You cannot access resources you do not own.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
