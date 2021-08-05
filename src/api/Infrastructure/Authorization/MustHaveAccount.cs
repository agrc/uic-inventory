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
          return AuthorizationResult.Fail("no authenticated user");
        }

        if (!requirement.User.HasClaim(x => x.Type == ClaimTypes.NameIdentifier)) {
          _log.ForContext("claims", requirement.User.Claims)
             .Warning("user is missing name identifier claim");

          return AuthorizationResult.Fail("user is missing required claims");
        }

        var utahIdClaim = requirement.User.FindFirst(ClaimTypes.NameIdentifier);
        if (utahIdClaim is null) {
          _log.ForContext("claims", requirement.User.Claims)
            .Warning("name identifier claim is empty");

          return AuthorizationResult.Fail("user is missing required claims");
        }

        var account = await _context.Accounts.SingleOrDefaultAsync(x => x.UtahId == utahIdClaim.Value, token);

        if (account is null) {
          _log.ForContext("claims", requirement.User.Claims)
            .Warning("account does not exist for request");

          return AuthorizationResult.Fail("account does not exist");
        }

        _metadata.Account = account;

        return AuthorizationResult.Succeed();
      }
    }
  }
}
