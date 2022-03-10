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
  public class InventoryController : ControllerBase {
    private readonly IMediator _mediator;
    private readonly HasRequestMetadata _requestMetadata;
    private readonly ILogger _log;

    public InventoryController(IMediator mediator, HasRequestMetadata requestMetadata, ILogger log) {
      _mediator = mediator;
      _requestMetadata = requestMetadata;
      _log = log;
    }

    [HttpGet("/api/site/{siteId:min(1)}/inventories")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoriesForSitePayload>> GetInventoryAsync(int siteId, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetInventoriesBySite.Query(siteId), token);

        return Ok(new InventoriesForSitePayload(result, _requestMetadata.Site));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/inventories")
          .ForContext("requirement", ex.Message)
          .Warning("GetInventoryAsync requirements failure");

        return Unauthorized(new InventoriesForSitePayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/inventories")
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new InventoriesForSitePayload(ex));
      }
    }

    [HttpGet("/api/site/{siteId:min(1)}/inventory/{inventoryId:min(-1)}")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> GetInventoryByIdAsync(int siteId, int inventoryId, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetInventoryById.Query(siteId, inventoryId), token);

        if (inventoryId == -1) {
          // creating a new inventory
          return Ok(new InventoryPayload(new(), _requestMetadata.Site));
        }

        if (result == null) {
          return NotFound(new InventoryPayload("Inventory not found"));
        }

        return Ok(new InventoryPayload(result, _requestMetadata.Site));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/Inventory/{inventoryId}")
          .ForContext("requirement", ex.Message)
          .Warning("GetInventoryByIdAsync requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/Inventory/{inventoryId}")
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }

    [HttpPost("/api/inventory")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> CreateInventoryAsync(InventoryCreationInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new CreateInventory.Command(input), token);

        return Created($"api/inventory/{result.Id}", new InventoryPayload(result, _requestMetadata.Site));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "POST:api/inventory")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("CreateInventoryAsync requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "POST:api/inventory")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }

    [HttpPut("/api/inventory")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> UpdateInventoryAsync(InventoryMutationInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new UpdateInventory.Command(input), token);

        return NoContent();
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "PUT:api/inventory")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("UpdateInventoryAsync requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "PUT:api/inventory")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }

    [HttpPost("/api/inventory/submit")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> SubmitInventoryAsync(InventorySubmissionInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new SubmitInventory.Command(input), token);

        return Accepted();
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "POST:api/inventory/submit")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("SubmitInventoryAsync requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "POST:api/inventory/submit")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }

    [HttpDelete("/api/inventory")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> DeleteInventoryAsync(InventoryDeletionInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new DeleteInventory.Command(input), token);

        return Accepted();
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "DELETE:api/inventory")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("DeleteInventoryAsync requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "DELETE:api/inventory")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }

    [HttpDelete("/api/inventory/reject")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> RejectInventoryAsync(InventoryDeletionInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new RejectInventory.Command(input), token);

        return Accepted();
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "DELETE:api/inventory/reject")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("RejectInventoryAsync requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "DELETE:api/inventory/reject")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }
  }
}
