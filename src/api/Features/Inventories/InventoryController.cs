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
    public async Task<ActionResult<InventoriesForSitePayload>> GetInventory(int siteId, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetInventoriesBySite.Query(siteId), token);

        return Ok(new InventoriesForSitePayload(result, _requestMetadata.Site));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"api/site/{siteId}/inventories")
          .Warning(ex, "requirements failure");

        return Unauthorized(new InventoriesForSitePayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"api/site/{siteId}/inventories")
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new InventoriesForSitePayload(ex));
      }
    }

    [HttpGet("/api/site/{siteId:min(1)}/inventory/{inventoryId:min(-1)}")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> GetInventoryById(int siteId, int inventoryId, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetInventoryById.Query(siteId, inventoryId), token);

        return Ok(new InventoryPayload(result, _requestMetadata.Site));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/Inventory/{inventoryId}")
          .Warning(ex, "requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/Inventory/{inventoryId}")
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }

    [HttpPost("/api/inventory")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> CreateInventory(InventoryInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new CreateInventory.Command(input), token);

        return Created($"api/Inventory/{result.Id}", new InventoryPayload(result, _requestMetadata.Site));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "POST:api/Inventory")
          .ForContext("input", input)
          .Warning(ex, "requirements failure");

        return Unauthorized(new InventoryPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "POST:api/Inventory")
          .ForContext("input", input)
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new InventoryPayload(ex));
      }
    }
  }
}
