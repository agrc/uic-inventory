using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;

namespace api.Infrastructure;
public class MustAlwaysFail : IAuthorizationRequirement {
    private class Handler() : IAuthorizationHandler<MustAlwaysFail> {

        public Task<AuthorizationResult> Handle(MustAlwaysFail requirement, CancellationToken token = default)
            => Task.FromResult(AuthorizationResult.Fail("A01:Simulated failure."));
    }
}
