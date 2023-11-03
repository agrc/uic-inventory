using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure;
public class MustOwnNotification(int id) : IAuthorizationRequirement {
    public int NotificationId { get; set; } = id;

    private class Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) : IAuthorizationHandler<MustOwnNotification> {
        private readonly ILogger _log = log;
        private readonly IAppDbContext _context = context;
        private readonly HasRequestMetadata _metadata = metadata;

        public async Task<AuthorizationResult> Handle(
          MustOwnNotification requirement,
          CancellationToken token = default) {
            _metadata.NotificationReceipt = new();

            var receipt = await _context.NotificationReceipts.SingleOrDefaultAsync(x => x.Id == requirement.NotificationId, token);

            if (receipt is null) {
                return AuthorizationResult.Fail("N01:This notification does not exist.");
            }

            if (receipt.RecipientId != _metadata.Account.Id) {
                return AuthorizationResult.Fail("N02:You cannot edit items that you do not own.");
            }

            _metadata.NotificationReceipt = receipt;

            return AuthorizationResult.Succeed();
        }
    }
}
