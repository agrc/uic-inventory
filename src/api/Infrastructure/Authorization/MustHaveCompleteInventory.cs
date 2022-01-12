using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public class MustHaveCompleteInventory : IAuthorizationRequirement {
    public MustHaveCompleteInventory(int inventoryId) {
      InventoryId = inventoryId;
    }

    public int InventoryId { get; }

    private class Handler : IAuthorizationHandler<MustHaveCompleteInventory> {
      private readonly ILogger _log;
      private readonly HasRequestMetadata _metadata;
      private readonly IAppDbContext _context;

      public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
        _context = context;
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustHaveCompleteInventory requirement,
        CancellationToken token = default) {
        var inventory = await _context.Inventories.SingleOrDefaultAsync(x => x.Id == requirement.InventoryId, token);

        if (inventory is null) {
          return AuthorizationResult.Fail("I01:You cannot access items that you do not own.");
        }

        _metadata.Inventory = inventory;

        if (_metadata.Inventory.Status != InventoryStatus.Incomplete) {
          return AuthorizationResult.Fail("I02:This inventory has already been submitted.");
        }

        var status = new List<bool> { _metadata.Inventory.DetailStatus, _metadata.Inventory.LocationStatus };

        if (_metadata.Inventory.SubClass == 5002) {
          status.Add(_metadata.Inventory.ContactStatus);
        }

        if (!status.All(x => x)) {
          _log.ForContext("inventory", _metadata.Inventory)
            .Warning("cannot submit to incomplete inventory");

          return AuthorizationResult.Fail("I03:You must complete your inventory before submitting.");
        }

        return AuthorizationResult.Succeed();
      }
    }
  }
}
