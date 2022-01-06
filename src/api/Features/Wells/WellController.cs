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
  public class WellController : ControllerBase {
    private readonly IMediator _mediator;
    private readonly ILogger _log;

    public WellController(IMediator mediator, ILogger log) {
      _mediator = mediator;
      _log = log;
    }

    [HttpPost("/api/well")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<WellPayload>> CreateWellAsync(WellInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new CreateWell.Command(input), token);

        return Created($"api/well/{result.Id}", new WellPayload(result));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "POST:api/well")
          .ForContext("input", input)
          .Warning(ex, "CreateWellAsync requirements failure");

        return Unauthorized(new WellPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "POST:api/well")
          .ForContext("input", input)
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new WellPayload(ex));
      }
    }

    [HttpPut("api/well")]
    [Consumes("multipart/form-data")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<WellPayload>> UpdateWellAsync([FromForm] WellDetailInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new UpdateWell.Command(input), token);

        return Accepted();
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "PUT:api/well")
          .ForContext("input", input)
          .Warning(ex, "UpdateWellAsync requirements failure");

        return Unauthorized(new WellPayload(ex));
      } catch (InvalidOperationException ex) {
        _log.ForContext("endpoint", "PUT:api/well")
          .ForContext("input", input)
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new WellPayload(ex.Message));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "PUT:api/well")
          .ForContext("input", input)
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new WellPayload(ex));
      }
    }

    [HttpDelete("/api/well")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<WellPayload>> DeleteWellAsync(WellInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new DeleteWell.Command(input), token);

        return Accepted();
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "DELETE:api/well")
          .ForContext("input", input)
          .Warning(ex, "DeleteWellAsync requirements failure");

        return Unauthorized(new WellPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "DELETE:api/well")
          .ForContext("input", input)
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new WellPayload(ex));
      }
    }
  }
}
