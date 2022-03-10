using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MediatR.Behaviors.Authorization.Exceptions;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.Features {
  [ApiController]
  public class AccountController : ControllerBase {
    private readonly IMediator _mediator;
    private readonly ILogger _log;

    public AccountController(IMediator mediator, ILogger log) {
      _mediator = mediator;
      _log = log;
    }

    [HttpGet("/api/me")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<AuthPayload>> GetMeAsync(CancellationToken token) {
      try {
        var payload = await _mediator.Send(new GetMyAccount.Query(Request.HttpContext.User), token);

        return Ok(new AuthPayload(payload));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "GET:api/me")
          .ForContext("requirement", ex.Message)
          .Warning("GetMeAsync requirements failure");

        return Unauthorized(new AuthPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "GET:api/me")
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new AuthPayload(ex));
      }
    }

    [HttpGet("/api/account/{id}")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<AccountPayload>> GetAccountByIdAsync(int id, CancellationToken token) {
      try {
        var payload = await _mediator.Send(new GetAccountById.Query(id), token);

        return Ok(new AccountPayload(payload));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"GET:api/account/{id}")
          .ForContext("requirement", ex.Message)
          .Warning("GetAccountByIdAsync requirements failure");

        return Unauthorized(new AccountPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"GET:api/account/{id}")
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new AccountPayload(ex));
      }
    }

    [HttpPut("/api/account")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<AccountPayload>> UpdateAccountAsync(AccountInput input, CancellationToken token) {
      try {
        var payload = await _mediator.Send(new UpdateAccount.Command(input), token);

        return Accepted(new AccountPayload(payload));
      } catch (UnauthorizedAccessException ex) {
        _log.ForContext("endpoint", "PUT:api/account")
          .ForContext("input", input)
          .Warning(ex, "Unauthorized access");

        return Unauthorized(new AccountPayload(ex));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "GET:api/account")
          .ForContext("requirement", ex.Message)
          .Warning("UpdateAccountAsync requirements failure");

        return Unauthorized(new AccountPayload(ex));
      } catch (ArgumentNullException ex) {
        _log.ForContext("endpoint", "PUT:api/account")
          .ForContext("input", input)
          .Warning(ex, "Account not found");

        return NotFound(new AccountPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "PUT:api/account")
          .Error(ex, "Unhandled excpetion");

        return StatusCode(500, new AccountPayload(ex));
      }
    }
  }
}
