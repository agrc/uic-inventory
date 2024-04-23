using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure;
public class MustHaveInventoryAdminAdditions() : IAuthorizationRequirement {
    private class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveInventoryAdminAdditions> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly AppDbContext _context = context;

        public async Task<AuthorizationResult> Handle(
          MustHaveInventoryAdminAdditions requirement,
          CancellationToken token = default) {
            var inventory = _metadata.Inventory;
            var site = _context.Sites.Single(x => x.Id == inventory.SiteFk);

            if (inventory is null) {
                return AuthorizationResult.Fail("I01:You cannot access items that you do not own.");
            }

            _metadata.Inventory = inventory;

            await Task.FromResult(0);

            var status = new List<string?> { inventory.Edocs, site.SiteId };

            if (status.Any(string.IsNullOrEmpty)) {
                _log.ForContext("inventory", _metadata.Inventory)
                  .Warning("Cannot approve incomplete inventory");

                return AuthorizationResult.Fail("IA03:You must add an EDOCs number and a site id before you can approve this inventory.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
