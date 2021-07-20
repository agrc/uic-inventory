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
  public class SiteQueries : ControllerBase {
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;
    private readonly IHasOwnership _ownershipResolver;

    public SiteQueries(
      AppDbContext context,
      IHttpContextAccessor accessor,
      IHasOwnership ownershipResolver,
      ILogger log) {
      _context = context;
      _accessor = accessor;
      _log = log;
      _ownershipResolver = ownershipResolver;
    }

    [HttpGet("/api/site/{siteId:min(1)}")]
    [Authorize]
    public async Task<ActionResult> GetSiteById(int siteId, CancellationToken token) {
      var (hasOwnership, statusCode, account, site, message) =
        await _ownershipResolver.HasSiteOwnershipAsync(_accessor, siteId, token);

      _log.ForContext("hasOwnership", hasOwnership)
          .ForContext("account", account)
          .ForContext("message", message)
          .Debug($"/api/sites/{siteId}");

      if (!hasOwnership || statusCode != HttpStatusCode.OK || account is null || site is null) {
        return StatusCode((int)statusCode, message);
      }

      return Ok(new {
        site.Id,
        site.Name,
        site.Ownership,
        site.NaicsPrimary,
        site.NaicsTitle,
        site.Address,
        site.Geometry
      });
    }

    [HttpGet("/api/sites/mine")]
    [Authorize]
    public async Task<ActionResult> MySites(CancellationToken token) {
      var (hasAccount, statusCode, account, message) = await _ownershipResolver.HasAccountAsync(_accessor, token);

      _log.ForContext("hasOwnership", hasAccount)
          .ForContext("account", account)
          .ForContext("message", message)
          .Debug("/api/sites/mine");

      if (!hasAccount || statusCode != HttpStatusCode.OK || account is null) {
        return StatusCode((int)statusCode, message);
      }

      var query = _context.Sites.AsQueryable();

      if (account.Access != AccessLevels.elevated) {
        query = query.Where(s => s.AccountFk == account.Id);
      }

      return Ok(await query
        .Select(x => new { x.Id, x.Name, x.NaicsTitle })
        .ToListAsync(token));
    }
  }
}
