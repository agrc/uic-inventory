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
  public class AccountMutations : ControllerBase {
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _accessor;
    private readonly IHasOwnership _ownershipResolver;
    private readonly ILogger _log;

    public AccountMutations(
      AppDbContext context,
      IHttpContextAccessor accessor,
      IHasOwnership ownershipResolver,
      ILogger log) {
      _context = context;
      _accessor = accessor;
      _ownershipResolver = ownershipResolver;
      _log = log;
    }

    [HttpPut("/api/account")]
    [Authorize]
    public async Task<ActionResult> UpdateAccountAsync(AccountInput input, CancellationToken token) {
      var (hasOwnership, statusCode, account, message) =
        await _ownershipResolver.HasAccountOwnershipAsync(_accessor, input.Id, token);

      _log.ForContext("hasOwnership", hasOwnership)
          .ForContext("input", input)
          .ForContext("account", account)
          .ForContext("verb", "PUT")
          .ForContext("message", message)
          .Debug("/api/account");

      if (!hasOwnership || statusCode != HttpStatusCode.OK || account is null) {
        return StatusCode((int)statusCode, message);
      }

      account = input.UpdateAccount(account);

      try {
        await _context.SaveChangesAsync(token);
      } catch (Exception) {
        return Problem(input.Id.ToString());
      }

      return Accepted(new AccountPayload(account));
    }
  }
}
