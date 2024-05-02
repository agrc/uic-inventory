using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustHaveReviewableInventory(int inventoryId) : IAuthorizationRequirement {
    public int InventoryId { get; } = inventoryId;

    private class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveReviewableInventory> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly AppDbContext _context = context;

        public async Task<AuthorizationResult> Handle(
          MustHaveReviewableInventory requirement,
          CancellationToken token = default) {
            var inventory = await _context.Inventories.SingleAsync(x => x.Id == requirement.InventoryId, token);

            var status = new List<bool> { inventory.DetailStatus, inventory.LocationStatus };

            if (inventory.IsSerInventory()) {
                status.Add(inventory.ContactStatus);
            }

            if (!status.All(x => x)) {
                _log.ForContext("inventory", inventory)
                    .ForContext("authorization", "MustHaveReviewableInventory:IS01")
                    .Warning("Cannot submit to incomplete inventory");

                return AuthorizationResult.Fail("IS01:You must complete your inventory before it can be submit.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
