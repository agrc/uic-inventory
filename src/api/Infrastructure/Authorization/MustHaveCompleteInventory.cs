using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustHaveCompleteInventory(int inventoryId) : IAuthorizationRequirement {
    public int InventoryId { get; } = inventoryId;

    private class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveCompleteInventory> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly AppDbContext _context = context;

        public async Task<AuthorizationResult> Handle(
          MustHaveCompleteInventory requirement,
          CancellationToken token = default) {
            var inventory = await _context.Inventories.SingleAsync(x => x.Id == requirement.InventoryId, token);

            if (inventory.Status != InventoryStatus.Incomplete) {
                _log.ForContext("inventory", inventory)
                    .ForContext("authorization", "MustHaveCompleteInventory:I02")
                    .Warning("already submitted inventory");

                return AuthorizationResult.Fail("I02:This inventory has already been submitted.");
            }

            var status = new List<bool> { inventory.DetailStatus, inventory.LocationStatus };

            if (inventory.IsSerInventory()) {
                status.Add(inventory.ContactStatus);
            }

            if (!status.All(x => x)) {
                _log.ForContext("inventory", inventory)
                    .ForContext("authorization", "MustHaveCompleteInventory:I03")
                    .Warning("incomplete inventory");

                return AuthorizationResult.Fail("I03:You must complete your inventory before submitting.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
