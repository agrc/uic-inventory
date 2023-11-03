using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure;
public class MustHaveEditableSiteStatus : IAuthorizationRequirement {
    private class Handler(HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveEditableSiteStatus> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        public Task<AuthorizationResult> Handle(
          MustHaveEditableSiteStatus requirement,
          CancellationToken token = default) =>
            Task.FromResult(AuthorizationResult.Succeed());
        //! TODO: implement
        // Task.FromResult(AuthorizationResult.Fail("S05:This site has been approved and can no longer be edited."));
    }
}
