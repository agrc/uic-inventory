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
    public async Task<ReadReceiptPayload> MarkAsRead(
      int id,
      [ScopedService] AppDbContext context,
      CancellationToken token) {
      var receipt = await context.NotificationReceipts.FirstOrDefaultAsync(x => x.Id == id, token);

      if (receipt is null) {
        return new ReadReceiptPayload(new[] {
          new UserError("Notification not found", "MISSING_NOTIFICATION")
        });
      }

      receipt.ReadAt = DateTime.Now;

      await context.SaveChangesAsync(token);

      return new ReadReceiptPayload(receipt.ReadAt);
    }
  }

  public class ReadReceiptPayload : Payload {
    public ReadReceiptPayload(DateTime? read) {
      ReadAt = read;
      Read = true;
    }

    public ReadReceiptPayload(IReadOnlyList<UserError> errors)
        : base(errors) {
    }

    public bool Read { get; set; }
    public DateTime? ReadAt { get; }
  }
}
