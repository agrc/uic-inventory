using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using api.Exceptions;
using api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace api.GraphQL {
  [ApiController]
  public class SiteMutations : ControllerBase {
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;
    private readonly IHasOwnership _ownershipResolver;

    public SiteMutations(AppDbContext context, IHttpContextAccessor accessor, IHasOwnership ownershipResolver, ILogger log) {
      _context = context;
      _accessor = accessor;
      _log = log;
      _ownershipResolver = ownershipResolver;
    }

    [HttpPost("/api/site")]
    [Authorize]
    public async Task<ActionResult> CreateSiteAsync(SiteInput input, CancellationToken token) {
      var (hasAccount, statusCode, account, message) =
        await _ownershipResolver.HasAccountAsync(_accessor, token);

      _log.ForContext("hasAccount", hasAccount)
          .ForContext("input", input)
          .ForContext("account", account)
          .ForContext("verb", "POST")
          .ForContext("message", message)
          .Debug("/api/site");

      if (!hasAccount || statusCode != HttpStatusCode.OK || account is null) {
        return StatusCode((int)statusCode, message);
      }

      var site = await _context.Sites.AddAsync(input.Update(new()), token);

      try {
        await _context.SaveChangesAsync(token);
      } catch (Exception ex) {
        _log.Error(ex, "Error saving site");

        return Problem(input.Id.ToString());
      }

      return Created($"site/{site.Entity.Id}/add-contacts", new SitePayload(site.Entity));
    }

    [HttpPut("/api/site")]
    [Authorize]
    public async Task<ActionResult> AddLocationAsync(SiteLocationInput input, CancellationToken token) {
      var (hasAccount, statusCode, account, site, message) =
        await _ownershipResolver.HasSiteOwnershipAsync(_accessor, input.SiteId, token);

      _log.ForContext("hasAccount", hasAccount)
          .ForContext("input", input)
          .ForContext("account", account)
          .ForContext("verb", "PUT")
          .ForContext("message", message)
          .Debug("/api/site");

      if (!hasAccount || statusCode != HttpStatusCode.OK || account is null || site is null) {
        return StatusCode((int)statusCode, message);
      }

      site.Address = input.Address;
      site.Geometry = input.Geometry;

      try {
        await _context.SaveChangesAsync(token);
      } catch (Exception ex) {
        throw new AccountNotFoundException(input.Id.ToString(), ex);
      }

      return Ok(new {site.Id});
    }
  }
}
