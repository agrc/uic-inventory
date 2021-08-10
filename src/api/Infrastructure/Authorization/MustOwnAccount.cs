using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public class MustOwnAccount : IAuthorizationRequirement {
    public MustOwnAccount(int id) {
      AccountId = id;
    }
    public int AccountId { get; }

    private class Handler : IAuthorizationHandler<MustOwnAccount> {
      private readonly ILogger _log;
      private readonly IAppDbContext _context;
      private readonly HasRequestMetadata _metadata;
      public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
        _context = context;
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustOwnAccount requirement,
        CancellationToken token = default) {
        var account = await _context.Accounts.SingleOrDefaultAsync(x => x.Id == requirement.AccountId, token) ?? new();

        if (_metadata.Account.Id != requirement.AccountId) {
          if (_metadata.Account.Access == AccessLevels.elevated) {
            _log.ForContext("accountId", requirement.AccountId)
                .ForContext("account", account)
                .Information("elevated access to external item");

            return AuthorizationResult.Succeed();
          }

          _log.ForContext("accessed account", account)
              .ForContext("accessed by", _metadata.Account)
              .Warning("access to external item not permitted");

          return AuthorizationResult.Fail("OA01:You cannot access resources you do not own.");
        }

        return AuthorizationResult.Succeed();
      }
    }
  }
}
