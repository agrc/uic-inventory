using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;

namespace api.GraphQL {
  [ExtendObjectType("Mutation")]
  public class NotificationMutations {
    [UseDbContext(typeof(AppDbContext))]
    public async Task<NotificationMutationResponse> UpdateNotification(
      NotificationInput input,
      [ScopedService] AppDbContext context,
      CancellationToken token) {
      var receipt = await context.NotificationReceipts.FirstOrDefaultAsync(x => x.Id == input.Id, token);

      if (receipt is null) {
        return new NotificationMutationResponse(new[] {
          new UserError("Notification not found", "MISSING_NOTIFICATION")
        });
      }

      var now = DateTime.Now;

      if (input.Read == true) {
        receipt.ReadAt = now;
      }

      if (input.Deleted == true) {
        receipt.DeletedAt = now;

        if (!receipt.ReadAt.HasValue) {
          receipt.ReadAt = now;
        }
      }

      await context.SaveChangesAsync(token);

      return new NotificationMutationResponse(receipt.ReadAt, receipt.DeletedAt);
    }
  }

  public class NotificationMutationResponse : Payload {
    public NotificationMutationResponse(DateTime? read, DateTime? deletedAt) {
      ReadAt = read;
      Read = read.HasValue;
      DeletedAt = deletedAt;
    }

    public NotificationMutationResponse(IReadOnlyList<UserError> errors)
        : base(errors) {
    }

    public bool Read { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? DeletedAt { get; set; }
  }
}
