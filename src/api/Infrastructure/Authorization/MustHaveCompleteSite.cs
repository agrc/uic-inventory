using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure {
  public class MustHaveCompleteSite : IAuthorizationRequirement {
    private class Handler : IAuthorizationHandler<MustHaveCompleteSite> {
      private readonly ILogger _log;
      private readonly HasRequestMetadata _metadata;
      public Handler(HasRequestMetadata metadata, ILogger log) {
        _metadata = metadata;
        _log = log;
      }
      public Task<AuthorizationResult> Handle(
        MustHaveCompleteSite requirement,
        CancellationToken token = default) {
        if (_metadata.Site.Status != SiteStatus.Complete) {
          _log.ForContext("site", _metadata.Site)
            .Warning("cannot add well to incomplete site");

          return Task.FromResult(AuthorizationResult.Fail("W01:You must complete your site information before submitting a well."));
        }

        return Task.FromResult(AuthorizationResult.Succeed());
      }
    }
  }
}
