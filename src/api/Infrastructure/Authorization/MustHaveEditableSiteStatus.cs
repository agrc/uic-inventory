using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure {
  public class MustHaveEditableSiteStatus : IAuthorizationRequirement {
    private class Handler : IAuthorizationHandler<MustHaveEditableSiteStatus> {
      private readonly ILogger _log;
      private readonly HasRequestMetadata _metadata;
      public Handler(HasRequestMetadata metadata, ILogger log) {
        _metadata = metadata;
        _log = log;
      }
      public Task<AuthorizationResult> Handle(
        MustHaveEditableSiteStatus requirement,
        CancellationToken token = default) =>
          Task.FromResult(AuthorizationResult.Succeed());
      // Task.FromResult(AuthorizationResult.Fail("S05:This site has been approved and can no longer be edited."));
    }
  }
}
