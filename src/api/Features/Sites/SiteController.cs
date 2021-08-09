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
  public class SiteController : ControllerBase {
    private readonly IMediator _mediator;
    private readonly ILogger _log;

    public SiteController(IMediator mediator, ILogger log) {
      _mediator = mediator;
      _log = log;
    }

    [HttpGet("/api/sites/mine")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> MySites(CancellationToken token) {
      try {
        var payload = await _mediator.Send(new GetSites.Query(), token);

        return Ok(payload);
      } catch (UnauthorizedAccessException e) {
        _log.ForContext("endpoint", "api/sites/mine")
          .Warning(e, "requirements failure");

        return Unauthorized(new { e.Message });
      } catch (Exception e) {
        _log.ForContext("endpoint", "api/sites/mine")
          .Fatal(e, "unhandled excpetion");

        return BadRequest();
      }
    }

    [HttpGet("/api/site/{siteId:min(1)}")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> GetSiteById(int siteId, CancellationToken token) {
      try {
        var payload = await _mediator.Send(new GetSiteById.Query(siteId), token);

        return Ok(payload);
      } catch (UnauthorizedException e) {
        _log.ForContext("endpoint", "api/site/id")
          .Warning(e, "requirements failure");

        return Unauthorized(new { e.Message });
      } catch (Exception e) {
        _log.ForContext("endpoint", "api/site/id")
          .Fatal(e, "unhandled excpetion");

        return BadRequest();
      }
    }

    [HttpPost("/api/site")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> CreateSiteAsync(SiteInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new CreateSite.Command(input), token);

        return Created($"api/site/{result.Id}", new SitePayload(result));
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

    [HttpPut("/api/site")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> UpdateSiteLocationAsync(SiteLocationInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new UpdateSite.Command(input), token);

        return Accepted(new SitePayload(result));
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

    [HttpDelete("/api/site")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> DeleteSiteAsync(SiteInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new DeleteSite.Command(input), token);

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
