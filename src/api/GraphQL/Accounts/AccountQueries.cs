using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.AspNetCore.Http;
using Serilog;

namespace api.GraphQL {
  [Authorize]
  [ExtendObjectType("Query")]
  public class AccountQueries {
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;

    public AccountQueries(IHttpContextAccessor accessor, ILogger log) {
      _accessor = accessor;
      _log = log;
    }

    [UseDbContext(typeof(AppDbContext))]
    public Account? GetMe(
      [ScopedService] AppDbContext context) {
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

      return context.Accounts.SingleOrDefault(x => x.UtahId == utahIdClaim.Value);
    }

    [UseDbContext(typeof(AppDbContext))]
    public IQueryable<Account> GetAccounts([ScopedService] AppDbContext context)
      => context.Accounts.OrderBy(x => x.LastName);

    // [UseProjection]
    [UseDbContext(typeof(AppDbContext))]
    public Task<Account> GetAccountById(
      int id,
      AccountByIdDataLoader loader,
      CancellationToken cancellationToken)
        => loader.LoadAsync(id, cancellationToken);

    [UseDbContext(typeof(AppDbContext))]
    public Task<IReadOnlyList<Account>> GetAccountsById(
      int[] ids,
      AccountByIdDataLoader loader,
      CancellationToken cancellationToken)
        => loader.LoadAsync(ids, cancellationToken);
  }
}
