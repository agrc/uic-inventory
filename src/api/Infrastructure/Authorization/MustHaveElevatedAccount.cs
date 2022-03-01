using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure {
  public class MustHaveElevatedAccount : IAuthorizationRequirement {
    private class Handler : IAuthorizationHandler<MustHaveElevatedAccount> {
      private readonly ILogger _log;
      private readonly HasRequestMetadata _metadata;
      public Handler(HasRequestMetadata metadata, ILogger log) {
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(MustHaveElevatedAccount requirement, CancellationToken token = default) {
        if (_metadata.Account.Access == AccessLevels.elevated) {
          return AuthorizationResult.Succeed();
        }

        _log.ForContext("accessed by", _metadata.Account)
           .Warning("access to elevated item not permitted");

        return AuthorizationResult.Fail("A04:Your account access does not permit this action.");
      }
    }
  }
}
