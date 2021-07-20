using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.GraphQL {
  [ApiController]
  public class ContactMutations : ControllerBase {
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;
    private readonly AppDbContext _context;
    private readonly IHasOwnership _ownershipResolver;

    public ContactMutations(AppDbContext context, IHasOwnership ownershipResolver, IHttpContextAccessor accessor, ILogger log) {
      _context = context;
      _ownershipResolver = ownershipResolver;
      _accessor = accessor;
      _log = log;
    }

    [HttpPost("/api/contact")]
    [Authorize]
    public async Task<ActionResult> CreateContactAsync(ContactInput input, CancellationToken token) {
      // * contact input.id is the site id
      var (hasOwnership, statusCode, account, _, message) =
        await _ownershipResolver.HasSiteOwnershipAsync(_accessor, input.Id, token);

      _log.ForContext("hasOwnership", hasOwnership)
          .ForContext("input", input)
          .ForContext("account", account)
          .ForContext("message", message)
          .Debug("/api/contact");

      if (!hasOwnership || statusCode != HttpStatusCode.OK || account is null) {
        return StatusCode((int)statusCode, message);
      }

      var contact = await _context.Contacts.AddAsync(input.Update(new()), token);

      try {
        await _context.SaveChangesAsync(token);
      } catch (Exception ex) {
        _log.Error(ex, "Error saving contact");

        return NotFound(input.Id.ToString());
      }

      return Created($"/api/site/{input.Id}/contacts", new {
        contact.Entity.Id,
        contact.Entity.FirstName,
        contact.Entity.LastName,
        contact.Entity.ContactType,
        contact.Entity.Email,
        contact.Entity.PhoneNumber,
        contact.Entity.Organization,
        contact.Entity.MailingAddress,
        contact.Entity.City,
        contact.Entity.State,
        contact.Entity.ZipCode
      });
    }
  }
}
