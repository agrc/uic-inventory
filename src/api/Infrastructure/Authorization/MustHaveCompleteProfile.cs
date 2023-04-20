using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure;
public class MustHaveCompleteProfile : IAuthorizationRequirement {
    private class Handler : IAuthorizationHandler<MustHaveCompleteProfile> {
        private readonly ILogger _log;
        private readonly HasRequestMetadata _metadata;
        public Handler(HasRequestMetadata metadata, ILogger log) {
            _metadata = metadata;
            _log = log;
        }
        public Task<AuthorizationResult> Handle(
          MustHaveCompleteProfile requirement,
          CancellationToken token = default) {
            if (!_metadata.Account.ProfileComplete) {
                _log.ForContext("account", _metadata.Account)
                  .Warning("Account has incomplete profile");

                return Task.FromResult(AuthorizationResult.Fail("P01:You must complete your profile before submitting a site."));
            }

            return Task.FromResult(AuthorizationResult.Succeed());
        }
    }
}
