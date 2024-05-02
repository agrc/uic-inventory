using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
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
            var site = await _context.Sites.SingleAsync(x => x.Id == _metadata.Inventory.SiteFk, cancellationToken: token);

            var status = new List<string?> { _metadata.Inventory.Edocs, site.SiteId };

            if (status.Any(string.IsNullOrEmpty)) {
                _log.ForContext("inventory", _metadata.Inventory)
                    .ForContext("site", site)
                    .ForContext("authorization", "MustHaveInventoryAdminAdditions:IS02")
                    .Warning("Cannot approve incomplete inventory");

                return AuthorizationResult.Fail("IS02:You must add an EDOCs number and a site id before you can authorize this inventory.");
            }

            return AuthorizationResult.Succeed();
        }
    }
}
