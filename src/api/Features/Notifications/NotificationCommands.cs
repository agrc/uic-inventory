using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features;
public static class UpdateNotification {
    public class Command(NotificationInput input) : IRequest<NotificationMutationPayload> {
        public NotificationInput Input { get; } = input;

        public class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IRequestHandler<Command, NotificationMutationPayload> {
            private readonly ILogger _log = log;
            private readonly AppDbContext _context = context;
            private readonly HasRequestMetadata _metadata = metadata;

            public async Task<NotificationMutationPayload> Handle(Command request, CancellationToken token) {
                _log.ForContext("input", request)
                 .Debug("Updating notification");

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
