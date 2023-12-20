using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustHaveSubmittedInventory(int inventoryId) : IAuthorizationRequirement {
    public int InventoryId { get; } = inventoryId;

    private class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveSubmittedInventory> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly AppDbContext _context = context;

        public async Task<AuthorizationResult> Handle(
          MustHaveSubmittedInventory requirement,
          CancellationToken token = default) {
            var inventory = await _context.Inventories.SingleOrDefaultAsync(x => x.Id == requirement.InventoryId, token);

            if (inventory is null) {
                return AuthorizationResult.Fail("IS01:You cannot access items that you do not own.");
            }

            _metadata.Inventory = inventory;

            if (_metadata.Inventory.Status != InventoryStatus.Submitted) {
                return AuthorizationResult.Fail("IS02:This is not submitted.");
            }

            var status = new List<bool> { _metadata.Inventory.DetailStatus, _metadata.Inventory.LocationStatus };

            if (_metadata.Inventory.SubClass == 5002) {
                status.Add(_metadata.Inventory.ContactStatus);
            }

            if (!status.All(x => x)) {
                _log.ForContext("inventory", _metadata.Inventory)
                  .Warning("Cannot submit to incomplete inventory");

                return AuthorizationResult.Fail("IS03:You must complete your inventory before it can be submit.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
