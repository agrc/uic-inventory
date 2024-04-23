using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Serilog;

namespace api.Infrastructure;
public class MustHaveNoFlaggedIssues() : IAuthorizationRequirement {
    private class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustHaveNoFlaggedIssues> {
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly AppDbContext _context = context;

        public async Task<AuthorizationResult> Handle(
          MustHaveNoFlaggedIssues requirement,
          CancellationToken token = default) {
            var inventory = _metadata.Inventory;

            if (!string.IsNullOrEmpty(inventory.Flagged)) {
                _log.ForContext("inventory", _metadata.Inventory)
                      .Warning("Cannot approve flagged inventory");

                return AuthorizationResult.Fail("IF01:You cannot approve an inventory with an unresolved flag.");
            }

            await Task.FromResult(0);

            return AuthorizationResult.Succeed();
        }
    }
}
