using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features {
  public static class UpdateNotification {
    public class Command : IRequest<NotificationMutationPayload> {
      public Command(NotificationInput input) {
        Input = input;
      }

      public NotificationInput Input { get; }

      public class Handler : IRequestHandler<Command, NotificationMutationPayload> {
        private readonly ILogger _log;
        private readonly IAppDbContext _context;
        private readonly HasRequestMetadata _metadata;

        public Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) {
          _context = context;
          _metadata = metadata;
          _log = log;
        }

        public async Task<NotificationMutationPayload> Handle(Command request, CancellationToken token) {
          _log.ForContext("input", request)
           .Debug("updating notification");

          var now = DateTime.UtcNow;

          var receipt = _metadata.NotificationReceipt;

          if (request.Input.Read == true) {
            receipt.ReadAt = now;
          }

          if (request.Input.Deleted == true) {
            receipt.DeletedAt = now;

            if (!receipt.ReadAt.HasValue) {
              receipt.ReadAt = now;
            }
          }

          await _context.SaveChangesAsync(token);

          return new NotificationMutationPayload(receipt);
        }
      }
    }
  }
}
