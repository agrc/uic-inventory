using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
    private readonly Dictionary<string, string> _mimeTypes = new() {
      { "png", "image/png" },
      { "jpg", "image/jpeg" },
      { "jpeg", "image/jpeg" },
      { "pdf", "application/pdf" },
      { "doc", "application/msword" },
      { "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    };

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
          .ForContext("requirement", ex.Message)
          .Warning("CreateWellAsync requirements failure");

        return Unauthorized(new WellPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "POST:api/well")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

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
          .ForContext("requirement", ex.Message)
          .Warning("UpdateWellAsync requirements failure");

        return Unauthorized(new WellPayload(ex));
      } catch (InvalidOperationException ex) {
        _log.ForContext("endpoint", "PUT:api/well")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new WellPayload(ex.Message));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "PUT:api/well")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

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
          .ForContext("requirement", ex.Message)
          .Warning("DeleteWellAsync requirements failure");

        return Unauthorized(new WellPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "DELETE:api/well")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new WellPayload(ex));
      }
    }

    [HttpGet("/api/site/{siteId:min(1)}/inventory/{inventoryId:min(-1)}/well/{wellIdRange}/{file}")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> GetWellFileAsync([FromRoute] WellFileInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetWellFiles.Command(input), token);

        var parts = input.File.Split('.');
        var type = parts[0].ToLower();
        var extension = parts.Last().ToLower();

        return File(result, _mimeTypes[extension]);
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "GET:api/well/file")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("GetWellFileAsync requirements failure");

        return Unauthorized(new WellFilePayload(ex));
      } catch (ArgumentNullException ex) {
        _log.ForContext("endpoint", "GET:api/well/file")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("GetWellFileAsync bad request");

        return StatusCode(400, new WellFilePayload(ex));
      } catch (FileNotFoundException ex) {
        _log.ForContext("endpoint", "GET:api/well/file")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("GetWellFileAsync cloud file not found");

        return StatusCode(404, new WellFilePayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "GET:api/well/file")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new WellFilePayload(ex));
      }
    }
  }
}
