using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using MediatR.Behaviors.Authorization.Exceptions;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.Features {
  [ApiController]
  public class NotificationController : ControllerBase {
    private readonly ILogger _log;
    private readonly IAppDbContext _context;
    private readonly IMediator _mediator;

    public NotificationController(IAppDbContext context,
      IMediator mediator,
      ILogger log) {
      _context = context;
      _mediator = mediator;
      _log = log;
    }

    [HttpGet("/api/notifications/mine")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> GetNotifications(CancellationToken token) {
      try {
        var notifications = await _mediator.Send(new GetNotifications.Query(), token);

        return Ok(notifications);
      } catch (Exception ex) {
        _log.ForContext("endpoint", "api/notifications/mine")
          .Error(ex, "error getting notifications");

        return Problem();
      }
    }

    [HttpPut("/api/notification")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> UpdateNotification([FromBody] NotificationInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new UpdateNotification.Command(input), token);

        return Accepted(result);
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "api/site")
          .Warning(ex, "requirements failure");

        return Unauthorized(new { ex.Message });
      } catch (Exception ex) {
        _log.ForContext("endpoint", "api/site")
          .Fatal(ex, "unhandled exception");

        return Problem(input.Id.ToString());
      }
    }
  }
}
