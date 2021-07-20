using System.Collections.Generic;
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
  public class AccountQueries : ControllerBase {
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger _log;

    private readonly AppDbContext _context;
    private readonly IHasOwnership _ownershipResolver;

    public AccountQueries(
      AppDbContext context,
      IHasOwnership ownershipResolver,
      IHttpContextAccessor accessor,
      ILogger log) {
      _context = context;
      _ownershipResolver = ownershipResolver;
      _accessor = accessor;
      _log = log;
    }

    [HttpGet("/api/me")]
    [Authorize]
    public async Task<ActionResult> GetMe(CancellationToken token) {
      var (hasAccount, statusCode, account, message) =
        await _ownershipResolver.HasAccountAsync(_accessor, token);

       _log.ForContext("hasAccount", hasAccount)
          .ForContext("account", account)
          .ForContext("verb", "GET")
          .ForContext("message", message)
          .Debug("/api/me");

      if (!hasAccount || account is null) {
        return StatusCode((int)statusCode, message);
      }

      return Ok(new AuthPayload(account));
    }

    [HttpGet("/api/accounts")]
    [Authorize]
    public async Task<List<Account>> GetAccounts(CancellationToken token)
      => await _context.Accounts.OrderBy(x => x.LastName).ToListAsync(token);

    [HttpGet("/api/account/{id}")]
    [Authorize]
    public async Task<ActionResult> GetAccountById(int id, CancellationToken token) {
      var (hasOwnership, statusCode, account, message) =
        await _ownershipResolver.HasAccountOwnershipAsync(_accessor, id, token);

      _log.ForContext("hasOwnership", hasOwnership)
          .ForContext("account", account)
          .ForContext("verb", "GET")
          .ForContext("message", message)
          .Debug($"/api/account/{id}");

      if (!hasOwnership || statusCode != HttpStatusCode.OK || account is null) {
        return StatusCode((int)statusCode, message);
      }

      return Ok(new AccountPayload(await _context.Accounts.SingleOrDefaultAsync(x => x.Id == id, token)));
    }
  }
}
