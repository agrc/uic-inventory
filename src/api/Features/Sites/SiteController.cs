using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MediatR.Behaviors.Authorization.Exceptions;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.Features;
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
    public async Task<ActionResult<SitePayload>> MySitesAsync(CancellationToken token) {
        try {
            var payload = await _mediator.Send(new GetSites.Query(), token);

            return Ok(payload);
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "GET:api/sites/mine")
              .ForContext("requirement", ex.Message)
              .Warning("MySitesAsync requirements failure");

            return Unauthorized(new SitePayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "GET:api/sites/mine")
              .Fatal(ex, "unhandled excpetion");

            return StatusCode(500, new SitePayload(ex));
        }
    }

    [HttpGet("/api/site/{siteId:min(1)}")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<SitePayload>> GetSiteByIdAsync(int siteId, CancellationToken token) {
        try {
            var payload = await _mediator.Send(new GetSiteById.Query(siteId), token);

            return Ok(payload);
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", $"GET:api/site/{siteId}")
              .ForContext("requirement", ex.Message)
              .Warning("GetSiteByIdAsync requirements failure");

            return Unauthorized(new SitePayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", $"GET:api/site/{siteId}")
              .Fatal(ex, "unhandled excpetion");

            return StatusCode(500, new SitePayload(ex));
        }
    }

    [HttpPost("/api/site")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<SitePayload>> CreateSiteAsync(SiteInput input, CancellationToken token) {
        try {
            var result = await _mediator.Send(new CreateSite.Command(input), token);

            return Created($"api/site/{result.Id}", new SitePayload(result));
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "POST:api/site")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("CreateSiteAsync requirements failure");

            return Unauthorized(new SitePayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "POST:api/site")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new SitePayload(ex));
        }
    }

    [HttpPut("/api/site")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<SitePayload>> UpdateSiteLocationAsync(SiteInput input, CancellationToken token) {
        try {
            var result = await _mediator.Send(new UpdateSite.Command(input), token);

            return Accepted(new SitePayload(result));
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "PUT:api/site")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("UpdateSiteLocationAsync requirements failure");

            return Unauthorized(new SitePayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "PUT:api/site")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new SitePayload(ex));
        }
    }

    [HttpDelete("/api/site")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<SitePayload>> DeleteSiteAsync(SiteInput input, CancellationToken token) {
        try {
            await _mediator.Send(new DeleteSite.Command(input), token);

            return Accepted();
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "DELETE:api/site")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("DeleteSiteAsync requirements failure");

            return Unauthorized(new SitePayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "DELETE:api/site")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new SitePayload(ex));
        }
    }
}
