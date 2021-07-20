using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.GraphQL {
  [ApiController]
  public class NotificationQueries : ControllerBase {
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;
    private readonly AppDbContext _context;
    private readonly IHasOwnership _ownershipResolver;

    public NotificationQueries(AppDbContext context, IHasOwnership ownershipResolver, IHttpContextAccessor accessor, ILogger log) {
      _context = context;
      _ownershipResolver = ownershipResolver;
      _accessor = accessor;
      _log = log;
    }

    [HttpGet("/api/notifications/mine")]
    [Authorize]
    public async Task<ActionResult> GetNotifications(CancellationToken token) {
      var (hasAccount, statusCode, account, message) = await _ownershipResolver.HasAccountAsync(_accessor, token);

      _log.ForContext("hasAccount", hasAccount)
          .ForContext("account", account)
          .ForContext("message", message)
          .Debug("/api/notifications/mine");

      if (!hasAccount || statusCode != HttpStatusCode.OK || account is null) {
        return StatusCode((int)statusCode, message);
      }

      var items = await _context.NotificationReceipts
       .Include(x => x.Notification)
       .Where(x => x.RecipientId == account.Id)
       .Select(x => new NotificationPayload(x.Notification, x))
       .ToListAsync(token);

      return Ok(new { firstName = account.FirstName, lastName = account.LastName, email = account.Email, notifications = items });
    }
  }
}
