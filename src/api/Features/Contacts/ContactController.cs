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
    public async Task<ActionResult<SiteContactPayload>> GetSiteContacts(int siteId, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetSiteContacts.Query(siteId), token);

        return Ok(result);
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"api/site/{siteId}/contacts")
          .Warning(ex, "requirements failure");

        return Unauthorized(new SiteContactPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"api/site/{siteId}/contacts")
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new SiteContactPayload(ex));
      }
    }

    [HttpPost("/api/contact")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult<ContactPayload>> CreateContactAsync(ContactInput input, CancellationToken token) {
      // * contact input.id is the site id
      try {
        var result = await _mediator.Send(new CreateContact.Command(input.Id, input), token);

        return Ok(new ContactPayload(result));
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "api/site/contact")
          .ForContext("input", input)
          .Warning(ex, "requirements failure");

        return Unauthorized(new ContactPayload(ex));
      } catch (Exception ex) {
        _log.ForContext("endpoint", "api/site/contact")
          .ForContext("input", input)
          .Fatal(ex, "unhandled exception");

        return StatusCode(500, new ContactPayload(ex));
      }
    }

    [HttpDelete("/api/contact")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public Task<ActionResult> DeleteContactAsync(ContactInput input, CancellationToken token) {
      throw new NotImplementedException();
    }
  }
}
