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
                _log.ForContext("inventory", _metadata.Inventory)
                    .ForContext("authorization", "MustHaveEditableInventoryStatus:I05")
                    .Warning("edits to submitted inventory");

                if (_metadata.Account.Id != _metadata.Inventory.AccountFk) {
                    if (_metadata.Account.Access == AccessLevels.elevated) {
                        _log.ForContext("inventoryId", _metadata.Inventory.Status)
                            .ForContext("account", _metadata.Account)
                            .ForContext("authorization", "MustHaveEditableInventoryStatus")
                            .Information("Elevated access to non editable item");

                        return Task.FromResult(AuthorizationResult.Succeed());
                    }
                }

                return Task.FromResult(AuthorizationResult.Fail("I05:This inventory has been submitted and can no longer be edited."));
            }

            return Task.FromResult(AuthorizationResult.Succeed());
        }
    }
}
