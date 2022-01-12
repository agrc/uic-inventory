using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public class MustOwnInventory : IAuthorizationRequirement {
    public MustOwnInventory(int id) {
      InventoryId = id;
    }
    public int InventoryId { get; }

    private class Handler : IAuthorizationHandler<MustOwnInventory> {
      private readonly ILogger _log;
      private readonly IAppDbContext _context;
      private readonly HasRequestMetadata _metadata;
      public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
        _context = context;
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustOwnInventory requirement,
        CancellationToken token = default) {
        var inventory = await _context.Inventories.SingleOrDefaultAsync(x => x.Id == requirement.InventoryId, token);

        if (inventory is null) {
          return AuthorizationResult.Fail("I01:You cannot access items that you do not own.");
        }

        _metadata.Inventory = inventory;

        if (_metadata.Account.Id != inventory.AccountFk) {
          if (_metadata.Account.Access == AccessLevels.elevated) {
            _log.ForContext("inventoryId", requirement.InventoryId)
                .ForContext("account", _metadata.Account)
                .Information("elevated access to external item");

            return AuthorizationResult.Succeed();
          }

          _log.ForContext("accessed by", _metadata.Account)
              .Warning("access to external item not permitted");

          return AuthorizationResult.Fail("I01:You cannot access items that you do not own.");
        }

        return AuthorizationResult.Succeed();
      }
    }
  }
}
