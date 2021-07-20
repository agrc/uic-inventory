using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.GraphQL {
  [ApiController]
  public class ContactQueries : ControllerBase {
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;
    private readonly IHasOwnership _ownershipResolver;

    public ContactQueries(
      AppDbContext context,
      IHttpContextAccessor accessor,
      IHasOwnership ownershipResolver,
      ILogger log) {
      _context = context;
      _accessor = accessor;
      _log = log;
      _ownershipResolver = ownershipResolver;
    }

    [HttpGet("/api/site/{siteId:min(1)}/contacts")]
    [Authorize]
    public async Task<ActionResult> GetSiteContacts(int siteId, CancellationToken token) {
      var (hasOwnership, statusCode, account, _, message) =
        await _ownershipResolver.HasSiteOwnershipAsync(_accessor, siteId, token);

      _log.ForContext("hasOwnership", hasOwnership)
          .ForContext("account", account)
          .ForContext("message", message)
          .Debug($"/api/sites/{siteId}/contacts");

      if (!hasOwnership || statusCode != HttpStatusCode.OK || account is null) {
        return StatusCode((int)statusCode, message);
      }

      var site = await _context.Sites
        .Include(x => x.Account)
        .Include(x => x.Contacts)
        .Where(site => site.Id == siteId)
        .FirstOrDefaultAsync(token);

      var contacts = site?.Contacts.Select(contact => new {
        contact.Id,
        contact.FirstName,
        contact.LastName,
        contact.ContactType,
        contact.Email,
        contact.PhoneNumber,
        contact.Organization,
        contact.MailingAddress,
        contact.City,
        contact.State,
        contact.ZipCode
      }).ToArray();

      return Ok(new {
        Name = site?.Name ?? "unknown",
        Owner = new AccountPayload(site?.Account),
        contacts
      });
    }
  }
}
