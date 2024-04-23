using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustHaveInventoryStatus(int inventoryId, IEnumerable<InventoryStatus> status) : IAuthorizationRequirement {
    public int InventoryId { get; } = inventoryId;
    public IEnumerable<InventoryStatus> AcceptableStatus { get; } = status;


    private class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveInventoryStatus> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly AppDbContext _context = context;

        public async Task<AuthorizationResult> Handle(
          MustHaveInventoryStatus requirement,
          CancellationToken token = default) {
            var inventory = await _context.Inventories.SingleOrDefaultAsync(x => x.Id == requirement.InventoryId, token);

            if (inventory is null) {
                return AuthorizationResult.Fail("IS01:You cannot access items that you do not own.");
            }

            _metadata.Inventory = inventory;

            if (!requirement.AcceptableStatus.Contains(inventory.Status)) {
                return AuthorizationResult.Fail($"IS02:Unexpected inventory status, {_metadata.Inventory.Status}.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
