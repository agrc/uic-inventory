using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.GraphQL {
  [ExtendObjectType("Query")]
  public class SiteQueries {
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;

    public SiteQueries(IHttpContextAccessor accessor, ILogger log) {
      _accessor = accessor;
      _log = log;
    }

    [UseDbContext(typeof(AppDbContext))]
    public IQueryable<Site> GetSites([ScopedService] AppDbContext context)
      => context.Sites;

    [UseDbContext(typeof(AppDbContext))]
    public async Task<Site> GetSiteById(int id, [ScopedService] AppDbContext context, CancellationToken token) {
      if (_accessor.HttpContext?.User.HasClaim(x => x.Type == ClaimTypes.NameIdentifier) != true) {
        _log.ForContext("claims", _accessor.HttpContext?.User.Claims)
           .Warning("User is missing name identifier claim");

        throw new System.Exception("user is missing required claims");
      }

      var utahIdClaim = _accessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      if (utahIdClaim is null) {
        _log.ForContext("claims", _accessor.HttpContext?.User.Claims)
           .Warning("Name identifier claim is empty");

        throw new System.Exception("user is missing required claims");
      }

      var account = context.Accounts.SingleOrDefault(x => x.UtahId == utahIdClaim.Value);
      if (account is null) {
        throw new System.Exception("account does not exist");
      }

      return await context.Sites.Where(s => s.Id == id && s.AccountFk == account.Id).SingleAsync(token);
    }


    [UseDbContext(typeof(AppDbContext))]
    public async Task<IEnumerable<Site>> MySites([ScopedService] AppDbContext context, CancellationToken token) {
      if (_accessor.HttpContext?.User.HasClaim(x => x.Type == ClaimTypes.NameIdentifier) != true) {
        _log.ForContext("claims", _accessor.HttpContext?.User.Claims)
           .Warning("User is missing name identifier claim");

        throw new System.Exception("user is missing required claims");
      }

      var utahIdClaim = _accessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      if (utahIdClaim is null) {
        _log.ForContext("claims", _accessor.HttpContext?.User.Claims)
           .Warning("Name identifier claim is empty");

        throw new System.Exception("user is missing required claims");
      }

      var account = context.Accounts.SingleOrDefault(x => x.UtahId == utahIdClaim.Value);
      if (account is null) {
        throw new System.Exception("account does not exist");
      }

      return await context.Sites.Where(s => s.AccountFk == account.Id).ToListAsync(token);
    }
  }
}
