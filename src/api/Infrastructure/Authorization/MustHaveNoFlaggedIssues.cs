using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure;
public class MustHaveNoFlaggedIssues() : IAuthorizationRequirement {
    private class Handler(HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveNoFlaggedIssues> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        public async Task<AuthorizationResult> Handle(
          MustHaveNoFlaggedIssues requirement,
          CancellationToken token = default) {

            if (!string.IsNullOrEmpty(_metadata.Inventory.Flagged)) {
                _log.ForContext("inventory", _metadata.Inventory)
                    .ForContext("authorization", "MustHaveNoFlaggedIssues:I06")
                    .Warning("Cannot approve flagged inventory");

                return AuthorizationResult.Fail("I06:You cannot approve an inventory with an unresolved issue.");
            }

            await Task.FromResult(0);

            return AuthorizationResult.Succeed();
        }
    }
}
