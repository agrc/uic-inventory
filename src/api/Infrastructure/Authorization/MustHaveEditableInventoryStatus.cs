using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure;
public class MustHaveEditableInventoryStatus : IAuthorizationRequirement {
    private class Handler(HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveEditableInventoryStatus> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        public Task<AuthorizationResult> Handle(
          MustHaveEditableInventoryStatus requirement,
          CancellationToken token = default) {
            if (!new List<InventoryStatus> { InventoryStatus.Incomplete, InventoryStatus.Complete }.Contains(_metadata.Inventory.Status)) {
                return Task.FromResult(AuthorizationResult.Fail("S04:This inventory has been submitted and can no longer be edited."));
            }

            return Task.FromResult(AuthorizationResult.Succeed());
        }
    }
}
