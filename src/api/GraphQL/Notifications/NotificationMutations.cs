using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.GraphQL {
  [ApiController]
  public class NotificationMutations : ControllerBase {
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;
    private readonly AppDbContext _context;
    private readonly IHasOwnership _ownershipResolver;

    public NotificationMutations(
      AppDbContext context,
      IHasOwnership ownershipResolver,
      IHttpContextAccessor accessor,
      ILogger log) {
      _context = context;
      _ownershipResolver = ownershipResolver;
      _accessor = accessor;
      _log = log;
    }

    [HttpPut("/api/notification")]
    [Authorize]
    public async Task<ActionResult> UpdateNotification([FromBody] NotificationInput input, CancellationToken token) {
      var (hasOwnership, statusCode, account, receipt, message) =
        await _ownershipResolver.HasNotificationOwnershipAsync(_accessor, input.Id, token);

      _log.ForContext("hasOwnership", hasOwnership)
          .ForContext("input", input)
          .ForContext("account", account)
          .ForContext("message", message)
          .Debug("/api/notification");

      if (!hasOwnership || statusCode != HttpStatusCode.OK || account is null || receipt is null) {
        if (statusCode == HttpStatusCode.NotFound) {
          return NotFound(new NotificationMutationResponse(new[] {
            new UserError(message, "MISSING_NOTIFICATION")
          }));
        }

        return StatusCode((int)statusCode, message);
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

      await _context.SaveChangesAsync(token);

      return Accepted(new NotificationMutationResponse(receipt));
    }
  }

  public class NotificationMutationResponse : Payload {
    public NotificationMutationResponse(NotificationReceipt receipt) {
      ReadAt = receipt.ReadAt;
      Read = receipt.ReadAt.HasValue;
      DeletedAt = receipt.DeletedAt;
      Deleted = receipt.DeletedAt.HasValue;
      Id = receipt.Id;
    }

    public NotificationMutationResponse(IReadOnlyList<UserError> errors)
        : base(errors) {
    }

    public bool Read { get; set; }
    public bool Deleted { get; set; }
    public int Id { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? DeletedAt { get; set; }
  }
}
