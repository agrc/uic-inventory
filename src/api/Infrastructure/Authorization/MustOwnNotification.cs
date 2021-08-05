using System.Threading;
using System.Threading.Tasks;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public class MustOwnNotification : IAuthorizationRequirement {
    public MustOwnNotification(int id) {
      NotificationId = id;
    }
    public int NotificationId { get; set; }

    private class Handler : IAuthorizationHandler<MustOwnNotification> {
      private readonly ILogger _log;
      private readonly IAppDbContext _context;
      private readonly HasRequestMetadata _metadata;
      public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
        _context = context;
        _metadata = metadata;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustOwnNotification requirement,
        CancellationToken token = default) {
        _metadata.NotificationReceipt = new();

        var receipt = await _context.NotificationReceipts.SingleOrDefaultAsync(x => x.Id == requirement.NotificationId, token);

        if (receipt is null) {
          return AuthorizationResult.Fail("This notification does not exist.");
        }

        if (receipt.RecipientId != _metadata.Account.Id) {
          return AuthorizationResult.Fail("You cannot edit items that you do not own.");
        }

        _metadata.NotificationReceipt = receipt;

        return AuthorizationResult.Succeed();
      }
    }
  }
}
