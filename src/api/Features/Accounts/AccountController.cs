using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.Features {
  [ApiController]
  public class AccountController : ControllerBase {
    private readonly IMediator _mediator;
    private readonly ILogger _log;

    public AccountController(
      IMediator mediator,
      ILogger log) {
      _mediator = mediator;
      _log = log;
    }

    [HttpGet("/api/me")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> GetMe(CancellationToken token) {
      try {
        var payload = await _mediator.Send(new GetMyAccount.Query(Request.HttpContext.User), token);

        return Ok(new AuthPayload(payload));
      } catch (UnauthorizedAccessException ex) {
        _log.ForContext("endpoint", "api/me")
         .Warning(ex, "requirements failure");

        return Unauthorized(new { ex.Message });
      } catch (Exception ex) {
        _log.ForContext("endpoint", "api/me")
          .Fatal(ex, "unhandled exception");

        return Problem();
      }
    }

    [HttpGet("/api/account/{id}")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> GetAccountById(int id, CancellationToken token) {
      try {
        var payload = await _mediator.Send(new GetAccountById.Query(id), token);

        return Ok(new AccountPayload(payload));
      } catch (UnauthorizedAccessException ex) {
        _log.ForContext("endpoint", $"api/account/{id}")
          .Warning(ex, "requirements failure");

        return Unauthorized(new { ex.Message });
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"api/account/{id}")
          .Fatal(ex, "unhandled exception");

        return Problem();
      }
    }

    [HttpPut("/api/account")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> UpdateAccountAsync(AccountInput input, CancellationToken token) {
      try {
        var payload = await _mediator.Send(new UpdateAccount.Command(input), token);

        return Accepted(new AccountPayload(payload));
      } catch (UnauthorizedAccessException e) {
        _log.ForContext("endpoint", "api/account")
          .Warning(e, "unauthorized access");

        return Unauthorized();
      } catch (ArgumentNullException e) {
        _log.ForContext("endpoint", "api/account")
          .Warning(e, "account not found");

        return NotFound();
      } catch (Exception e) {
        _log.ForContext("endpoint", "api/account")
          .Error(e, "unhandled excpetion");

        return BadRequest();
      }
    }
  }
}
