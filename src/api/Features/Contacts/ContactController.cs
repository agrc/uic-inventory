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
    public async Task<ActionResult> GetSiteContacts(int siteId, CancellationToken token) {
      try {
        var result = await _mediator.Send(new GetSiteContacts.Query(siteId), token);

        return Ok(result);
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", $"api/site/{siteId}/contacts")
          .Warning(ex, "requirements failure");

        return Unauthorized(new { ex.Message });
      } catch (Exception ex) {
        _log.ForContext("endpoint", $"api/site/{siteId}/contacts")
          .Fatal(ex, "unhandled exception");

        return Problem();
      }
    }

    [HttpPost("/api/contact")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public async Task<ActionResult> CreateContactAsync(ContactInput input, CancellationToken token) {
      // * contact input.id is the site id
      try {
        var result = await _mediator.Send(new CreateContact.Command(input.Id, input), token);

        return Ok(result);
      } catch (UnauthorizedException ex) {
        _log.ForContext("endpoint", "api/site/contact")
          .Warning(ex, "requirements failure");

        return Unauthorized(new { ex.Message });
      } catch (Exception ex) {
        _log.ForContext("endpoint", "api/site/contact")
          .Fatal(ex, "unhandled exception");

        return Problem();
      }
    }

    [HttpPut("/api/contact")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public Task<ActionResult> EditContactAsync(ContactInput input, CancellationToken token) {
      throw new NotImplementedException();
    }

    [HttpDelete("/api/contact")]
    [Authorize(CookieAuthenticationDefaults.AuthenticationScheme)]
    public Task<ActionResult> DeleteContactAsync(ContactInput input, CancellationToken token) {
      throw new NotImplementedException();
    }
  }
}
