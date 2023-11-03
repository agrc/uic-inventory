using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustOwnInventory(int id) : IAuthorizationRequirement {
    public int InventoryId { get; } = id;

    private class Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustOwnInventory> {
        private readonly ILogger _log = log;
        private readonly IAppDbContext _context = context;
        private readonly HasRequestMetadata _metadata = metadata;

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
                        .Information("Elevated access to external item");

                    return AuthorizationResult.Succeed();
                }

                _log.ForContext("accessed by", _metadata.Account)
                    .Warning("Access to external item not permitted");

                return AuthorizationResult.Fail("I01:You cannot access items that you do not own.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
