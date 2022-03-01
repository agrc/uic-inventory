using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure {
  public class MustHaveEditableInventoryStatus : IAuthorizationRequirement {
    private class Handler : IAuthorizationHandler<MustHaveEditableInventoryStatus> {
      private readonly ILogger _log;
      private readonly HasRequestMetadata _metadata;
      public Handler(HasRequestMetadata metadata, ILogger log) {
        _metadata = metadata;
        _log = log;
      }
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
}
