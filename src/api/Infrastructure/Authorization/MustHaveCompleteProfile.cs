using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure;
public class MustHaveCompleteProfile : IAuthorizationRequirement {
    private class Handler(HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveCompleteProfile> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        public Task<AuthorizationResult> Handle(
          MustHaveCompleteProfile requirement,
          CancellationToken token = default) {
            if (!_metadata.Account.ProfileComplete) {
                _log.ForContext("account", _metadata.Account)
                    .ForContext("authorization", "MustHaveCompleteProfile:P01")
                    .Warning("Account has incomplete profile");

                return Task.FromResult(AuthorizationResult.Fail("P01:You must complete your profile before submitting a site."));
            }

            return Task.FromResult(AuthorizationResult.Succeed());
        }
    }
}
