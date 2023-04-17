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
  public class ContactsController : ControllerBase {
    private readonly IMediator _mediator;
    private readonly ILogger _log;

    public ContactsController(IMediator mediator, ILogger log) {
      _mediator = mediator;
      _log = log;
    }

    [HttpGet("/api/site/{siteId:min(1)}/contacts")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<SiteContactPayload>> GetSiteContactsAsync(int siteId, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetSiteContacts.Query(siteId), token);

        return Ok(result);
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/contacts")
          .ForContext("requirement", ex.Message)
          .Warning("GetSiteContactsAsync requirements failure");

        return Unauthorized(new SiteContactPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"GET:api/site/{siteId}/contacts")
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new SiteContactPayload(ex));
      }
    }

    [HttpPost("/api/contact")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<ContactPayload>> CreateContactAsync(ContactInput input, CancellationToken token) {
      try {
        var result = await _mediator.Send(new CreateContact.Command(input.SiteId, input), token);

        return Ok(new ContactPayload(result));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "POST:api/site/contact")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("CreateContactAsync requirements failure");

        return Unauthorized(new ContactPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "POST:api/site/contact")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new ContactPayload(ex));
      }
    }

    [HttpDelete("/api/contact")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<ContactPayload>> DeleteContactAsync(ContactInput input, CancellationToken token) {
      try {
        await _mediator.Send(new DeleteContact.Command(input), token);

        return Accepted();
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "DELETE:api/contact")
          .ForContext("input", input)
          .ForContext("requirement", ex.Message)
          .Warning("DeleteContactAsync requirements failure");

        return Unauthorized(new ContactPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "DELETE:api/contact")
          .ForContext("input", input)
          .Fatal(ex, "Unhandled exception");

        return StatusCode(500, new ContactPayload(ex));
      }
    }
  }
}
