using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MediatR.Behaviors.Authorization.Exceptions;
// using Microsoft.AspNetCore.Authentication.Cookies;
// using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.Features;
[ApiController]
public class TransferController(IMediator mediator, ILogger log) : ControllerBase {
    private readonly ILogger _log = log;
    private readonly IMediator _mediator = mediator;

    [HttpGet("/api/transfer/test")]
    // [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> TestDbConnectionAsync(CancellationToken token) {
        try {
            var result = await _mediator.Send(new Transfer.Command(), token);

            return Ok(result);
        } catch (UnauthorizedAccessException ex) {
            _log.ForContext("endpoint", "GET:/api/transfer/test")
              .Warning(ex, "Unauthorized access");

            return Unauthorized(ex);
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "GET:api/transfer/test")
              .ForContext("requirement", ex.Message)
              .Warning("TestDbConnectionAsync requirements failure");

            return Unauthorized(ex);
        } catch (Exception ex) {
            _log.ForContext("endpoint", "GET:/api/transfer/test")
              .Error(ex, "error testing database connection");

            return StatusCode(500, ex);
        }
    }
}
