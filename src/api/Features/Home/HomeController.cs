using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Infrastructure;
using api.GraphQL;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Features.Home {
  [ApiController]
  [Route("[controller]")]
  public class HomeController : ControllerBase {
    private readonly AppDbContext _context;

    public HomeController(AppDbContext context) {
      _context = context;
    }
    [HttpGet("/test/")]
    public string Home() => "Hello World";

    [Authorize]
    [HttpGet("/test/claims")]
    public Dictionary<string, string> Roles() => HttpContext.User.Claims.ToDictionary(key => key.Type, x => x.Value);

    [Authorize]
    [HttpGet("/test/logout")]
    public async Task<string> Logout() {
      await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

      return "bye";
    }

    [Authorize]
    [HttpGet("/test/notification")]
    public async Task<string> CreateNotification() {
      var ids = _context.Accounts.Where(x => x.ReceiveNotifications == true).Select(x => x.Id);
      var recipients = new List<NotificationReceipt>();

      foreach (var id in ids) {
        recipients.Add(new NotificationReceipt {
          RecipientId = id
        });
      }

      var notification = new Notification {
        CreatedAt = DateTime.Now,
        // NotificationType = Entities.NotificationTypes.new_user_registration,
        AdditionalData = new Dictionary<string, object> {
          { "name", "new"},
          { "email", "differnt@test.com" }
        },
        Url = "https://localhost:5001/account/2/profile",
        NotificationReceipt = recipients
      };

      await _context.Notifications.AddAsync(notification, default);

      await _context.SaveChangesAsync();

      return "ok";
    }

    [Authorize]
    [HttpGet("/test/bubble")]
    public IReadOnlyList<Notification> GetNotifications() {
      const int recipient = 1;

      return _context.NotificationReceipts
        .Include(x => x.Notification)
        .Where(x => x.RecipientId == recipient)
        .Select(x => x.Notification)
        .ToList();
    }
  }
}
