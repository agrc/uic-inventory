using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using MediatR.Behaviors.Authorization.Exceptions;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.Features;
[ApiController]
public class InventoryController(IMediator mediator, HasRequestMetadata requestMetadata, ILogger log) : ControllerBase {
    private readonly IMediator _mediator = mediator;
    private readonly HasRequestMetadata _requestMetadata = requestMetadata;
    private readonly ILogger _log = log;

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
            await _mediator.Send(new SubmitInventory.Command(input), token);

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
    public async Task<ActionResult<InventoryPayload>> DeleteInventoryAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            await _mediator.Send(new DeleteInventory.Command(input), token);

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
    public async Task<ActionResult<InventoryPayload>> RejectInventoryAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            await _mediator.Send(new RejectInventory.Command(input), token);

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

    [HttpPost("/api/inventory/download")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> DownloadInventoryAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            var result = await _mediator.Send(new DownloadInventory.Command(input), token);

            return Ok(new InventoryReportPayload(result));
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/download")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("DownloadInventoryAsync requirements failure");

            return Unauthorized(new InventoryPayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "POST:api/inventory/download")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new InventoryPayload(ex));
        }
    }

    [HttpPost("/api/inventory/review")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> ReviewInventoryAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            await _mediator.Send(new UnderReviewInventory.Command(input), token);

            return Accepted();
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/review")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("ReviewInventoryAsync requirements failure");

            return Unauthorized(new InventoryPayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "POST:api/inventory/review")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new InventoryPayload(ex));
        }
    }

    [HttpPost("/api/inventory/approve")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> ApproveInventoryAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            await _mediator.Send(new ApproveInventory.Command(input), token);

            return Accepted();
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/approve")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("ApproveInventoryAsync requirements failure");

            return Unauthorized(new InventoryPayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "POST:api/inventory/approve")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new InventoryPayload(ex));
        }
    }
    [HttpPost("/api/inventory/authorize")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> AuthorizeInventoryAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            await _mediator.Send(new AuthorizeInventory.Command(input), token);

            return Accepted();
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/authorize")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("AuthorizeInventoryAsync requirements failure");

            return Unauthorized(new InventoryPayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "POST:api/inventory/authorize")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new InventoryPayload(ex));
        }
    }
    [HttpPost("/api/inventory/complete")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<InventoryPayload>> CompleteInventoryAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            await _mediator.Send(new CompleteInventory.Command(input), token);

            return Accepted();
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/complete")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("CompleteInventoryAsync requirements failure");

            return Unauthorized(new InventoryPayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "POST:api/inventory/complete")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new InventoryPayload(ex));
        }
    }

    [HttpGet("/api/site/{siteId:min(1)}/inventory/{inventoryId:min(-1)}/signature.pdf")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> GetInventorySignatureAsync(int siteId, int inventoryId, CancellationToken token) {
        try {
            var result = await _mediator.Send(new GetInventorySignature.Command(siteId, inventoryId), token);

            return File(result, "application/pdf");
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "GET:api/inventory/signature")
              .ForContext("site", siteId)
              .ForContext("inventory", inventoryId)
              .ForContext("requirement", ex.Message)
              .Warning("GetInventorySignatureAsync requirements failure");

            return Unauthorized(new InventoryPayload(ex));
        } catch (ArgumentNullException ex) {
            _log.ForContext("endpoint", "GET:api/inventory/signature")
              .ForContext("site", siteId)
              .ForContext("inventory", inventoryId)
              .ForContext("requirement", ex.Message)
              .Warning("GetInventorySignatureAsync bad request");

            return StatusCode(400, new InventoryPayload(ex));
        } catch (FileNotFoundException ex) {
            _log.ForContext("endpoint", "GET:api/inventory/signature")
              .ForContext("site", siteId)
              .ForContext("inventory", inventoryId)
              .ForContext("requirement", ex.Message)
              .Warning("GetInventorySignatureAsync cloud file not found");

            return StatusCode(404, new InventoryPayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "GET:api/inventory/signature")
              .ForContext("site", siteId)
              .ForContext("inventory", inventoryId)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new InventoryPayload(ex));
        }
    }

    [HttpPost("/api/inventory/ground-water")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> UpdateGroundWaterContactsAsync(ExistingInventoryInput input, CancellationToken token) {
        try {
            await _mediator.Send(new UpdateGroundWaterContacts.Command(input.SiteId, input.InventoryId), token);

            return Accepted();
        } catch (UnauthorizedException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/ground-water")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("UpdateGroundWaterContactsAsync requirements failure");

            return Unauthorized(new InventoryPayload(ex));
        } catch (ArgumentNullException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/ground-water")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("UpdateGroundWaterContactsAsync bad request");

            return StatusCode(400, new InventoryPayload(ex));
        } catch (FileNotFoundException ex) {
            _log.ForContext("endpoint", "POST:api/inventory/ground-water")
              .ForContext("input", input)
              .ForContext("requirement", ex.Message)
              .Warning("UpdateGroundWaterContactsAsync cloud file not found");

            return StatusCode(404, new InventoryPayload(ex));
        } catch (Exception ex) {
            _log.ForContext("endpoint", "POST:api/inventory/ground-water")
              .ForContext("input", input)
              .Fatal(ex, "Unhandled exception");

            return StatusCode(500, new InventoryPayload(ex));
        }
    }
}
