using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public class MustHaveAccount : IAuthorizationRequirement {
    public MustHaveAccount(ClaimsPrincipal user) {
      User = user;
    }
    public ClaimsPrincipal? User { get; }
    private class Handler : IAuthorizationHandler<MustHaveAccount> {
      private readonly ILogger _log;
      private readonly IAppDbContext _context;
      private readonly HasRequestMetadata _metadata;
      public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
        _context = context;
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustHaveAccount requirement,
        CancellationToken token = default) {
        _metadata.Account = new();

        if (requirement.User == null) {
          return AuthorizationResult.Fail("A01:You must authenticated with UtahID.");
        }

        if (!requirement.User.HasClaim(x => x.Type == ClaimTypes.NameIdentifier)) {
          _log.ForContext("claims", requirement.User.Claims)
             .Warning("User is missing name identifier claim");

          return AuthorizationResult.Fail("A02:Your account is missing required UtahID information.");
        }

        var utahIdClaim = requirement.User.FindFirst(ClaimTypes.NameIdentifier);
        if (utahIdClaim is null) {
          _log.ForContext("claims", requirement.User.Claims)
            .Warning("Name identifier claim is empty");

          return AuthorizationResult.Fail("A02:Your account is missing required UtahID information.");
        }

        var account = await _context.Accounts.SingleOrDefaultAsync(x => x.UtahId == utahIdClaim.Value, token);

        if (account is null) {
          _log.ForContext("claims", requirement.User.Claims)
            .Warning("Account does not exist for request");

          return AuthorizationResult.Fail("A03:There is no UIC account for this UtahID account.");
        }

        _metadata.Account = account;

        return AuthorizationResult.Succeed();
      }
    }
  }
}
