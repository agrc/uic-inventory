using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MediatR.Behaviors.Authorization.Exceptions;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace api.Features {
  [ApiController]
  public class EmailController : ControllerBase {
    private readonly ILogger _log;
    private readonly IMediator _mediator;
    private readonly string _email;
    public EmailController(IMediator mediator, IConfiguration configuration, ILogger log) {
      _mediator = mediator;
      _log = log;
      _email = configuration.GetSection("App")["AdminEmail"];
    }

    [HttpPost("/api/notify/staff")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<EmailPayload>> SendMailAsync(EmailInput email, CancellationToken token) {
      try {
        var payload = await _mediator.Send(new SendEmail.Command(_email, email.Message), token);

        return Accepted(payload);
      } catch (UnauthorizedAccessException ex) {
        _log.ForContext("endpoint", "POST:/api/notify/staff")
          .Warning(ex, "Unauthorized access");

        return Unauthorized(new EmailPayload(ex));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "POST:api/notify/staff")
          .ForContext("email", email)
          .ForContext("requirement", ex.Message)
          .Warning("SendMailAsync requirements failure");

        return Unauthorized(new EmailPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "POST:/api/notify/staff")
          .Error(ex, "error sending email");

        return StatusCode(500, new EmailPayload(ex));
      }
    }
  }
}
