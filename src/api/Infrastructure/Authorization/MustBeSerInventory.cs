using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustBeSerInventory(int inventoryId) : IAuthorizationRequirement {
    public int InventoryId { get; set; } = inventoryId;

    private class Handler(AppDbContext context, ILogger log) : IAuthorizationHandler<MustBeSerInventory> {
        private readonly ILogger _log = log;
        private readonly AppDbContext _context = context;

        public async Task<AuthorizationResult> Handle(
          MustBeSerInventory requirement,
          CancellationToken token = default) {
            var inventory = await _context.Inventories
              .SingleOrDefaultAsync(x => x.Id == requirement.InventoryId, token) ?? new();

            if (!inventory.IsSerInventory()) {
                _log.ForContext("inventory", inventory)
                    .ForContext("authorization", "MustBeSerInventory:I07")
                    .Warning("Cannot add SER contact to a non SER inventory.");

                return AuthorizationResult.Fail("I07:Cannot add SER contact to a non SER inventory.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
