using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.GraphQL {
  [Authorize]
  [ExtendObjectType("Query")]
  public class NotificationQueries {
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;

    public NotificationQueries(IHttpContextAccessor accessor, ILogger log) {
      _accessor = accessor;
      _log = log;
    }

    [UseApplicationDbContext]
    // [UseProjection]
    public Task<List<NotificationPayload>> GetNotifications([ScopedService] AppDbContext context,
      int id) {

      if (_accessor.HttpContext?.User.HasClaim(x => x.Type == ClaimTypes.NameIdentifier) != true) {
        _log.ForContext("claims", _accessor.HttpContext?.User.Claims)
           .Fatal("User is missing name identifier claim");

        return Task.FromResult(new List<NotificationPayload>());
      }

      var utahIdClaim = _accessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      if (utahIdClaim is null) {
        _log.ForContext("claims", _accessor.HttpContext?.User.Claims)
           .Fatal("Name identifier claim is empty");

        return Task.FromResult(new List<NotificationPayload>());
      }

      var user = context.Accounts.Where(x => x.UtahId == utahIdClaim.Value).Select(x => new { x.Id, x.Access }).Single();

      if (user.Access == AccessLevels.standard && user.Id != id) {
        _log.ForContext("user", utahIdClaim.Value)
           .Warning("User tried to access protected data");

        return Task.FromResult(new List<NotificationPayload>());
      }

      return context.NotificationReceipts
       .Include(x => x.Notification)
       .Where(x => x.RecipientId == id)
       .Select(x => new NotificationPayload(x.Notification, x)).ToListAsync();
    }
  }
}
