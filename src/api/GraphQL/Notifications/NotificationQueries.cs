using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;

namespace api.GraphQL {
  [Authorize]
  [ExtendObjectType("Query")]
  public class NotificationQueries {
    [UseApplicationDbContext]
    [UseProjection]
    public Task<List<NotificationPayload>> GetNotifications([ScopedService] AppDbContext context, int id) =>

      // var utahIdClaim = _accessor.HttpContext.User.Claims.First(x => x.Type == ClaimTypes.NameIdentifier);
      // var id = context.Accounts.Where(x => x.UtahId == utahIdClaim.Value).Select(x => x.Id).Single();

      context.NotificationReceipts
      .Include(x => x.Notification)
      .Where(x => x.RecipientId == id)
      .Select(x => new NotificationPayload(x.Notification, x)).ToListAsync();
  }
}
