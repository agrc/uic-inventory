using System.Net;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.GraphQL;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public interface IHasOwnership {
    Task<(bool, HttpStatusCode, Account?, string)> HasAccountAsync(
      IHttpContextAccessor contextAccessor,
      CancellationToken token);
    Task<(bool, HttpStatusCode, Account?, string)> HasAccountOwnershipAsync(
      IHttpContextAccessor contextAccessor,
      int id,
      CancellationToken token);
    Task<(bool, HttpStatusCode,  Account?, NotificationReceipt?, string)> HasNotificationOwnershipAsync(IHttpContextAccessor contextAccessor,
      int id,
      CancellationToken token);
    Task<(bool, HttpStatusCode,  Account?, Site?, string)> HasSiteOwnershipAsync(IHttpContextAccessor contextAccessor,
      int id,
      CancellationToken token);
  }

  public class OwnershipResolver : IHasOwnership {
    private readonly AppDbContext _context;
    private readonly ILogger _log;

    public OwnershipResolver(AppDbContext context, ILogger log)
    {
      _context = context;
      _log = log;
    }

    public async Task<(bool, HttpStatusCode, Account?, string)> HasAccountAsync(
      IHttpContextAccessor contextAccessor,
      CancellationToken token) {
      if (contextAccessor.HttpContext?.User.HasClaim(x => x.Type == ClaimTypes.NameIdentifier) != true) {
        _log.ForContext("claims", contextAccessor.HttpContext?.User.Claims)
           .Warning("user is missing name identifier claim");

        return (false, HttpStatusCode.BadRequest, null, "user is missing required claims");
      }

      var utahIdClaim = contextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
      if (utahIdClaim is null) {
        _log.ForContext("claims", contextAccessor.HttpContext?.User.Claims)
           .Warning("name identifier claim is empty");

        return (false, HttpStatusCode.BadRequest, null, "user is missing required claims");
      }

      var account = await _context.Accounts.SingleOrDefaultAsync(x => x.UtahId == utahIdClaim.Value, token);

      if (account is null) {
        _log.ForContext("claims", contextAccessor.HttpContext?.User.Claims)
           .Warning("account does not exist for request");

        return (false, HttpStatusCode.BadRequest, null, "account does not exist");
      }

      return (true, HttpStatusCode.OK, account, string.Empty);
    }

    public async Task<(bool, HttpStatusCode, Account?, string)> HasAccountOwnershipAsync(
        IHttpContextAccessor contextAccessor,
        int id,
        CancellationToken token) {
      var (hasAccount, statusCode, account, message) = await HasAccountAsync(contextAccessor, token);

      if (!hasAccount || statusCode != HttpStatusCode.OK || account is null) {
         return (hasAccount, statusCode, account, message);
      }

      if (account.Id != id) {
        if (account.Access == AccessLevels.elevated) {
          _log.ForContext("accountId", id)
              .ForContext("account", account)
              .Information("elevated access to external item");

          return (true, HttpStatusCode.OK, account, string.Empty);
        }

        _log.ForContext("account", account)
            .Warning("access to external item not permitted");

        return (false, HttpStatusCode.Unauthorized, null, "account does not own requested resource");
      }

      return (true, HttpStatusCode.OK, account, string.Empty);
    }

    public async Task<(bool, HttpStatusCode, Account?, NotificationReceipt?, string)> HasNotificationOwnershipAsync(
      IHttpContextAccessor contextAccessor,
      int id,
      CancellationToken token) {
      var (hasAccount, statusCode, account, message) = await HasAccountAsync(contextAccessor, token);

      if (!hasAccount || statusCode != HttpStatusCode.OK || account is null) {
        return (hasAccount, statusCode, account, null, message);
      }

      var receipt = await _context.NotificationReceipts.FirstOrDefaultAsync(x => x.Id == id, token);

      if (receipt is null) {
        return (false, HttpStatusCode.NotFound, account, null, "notification not found");
      }

      if (receipt.RecipientId != account.Id) {
        return (false, HttpStatusCode.Unauthorized, account, null, "account does not own requested resource");
      }

      return (true, HttpStatusCode.OK, account, receipt, string.Empty);
    }

    public async Task<(bool, HttpStatusCode, Account?, Site?, string)> HasSiteOwnershipAsync(
      IHttpContextAccessor contextAccessor,
      int id,
      CancellationToken token) {
      var (hasAccount, statusCode, account, message) = await HasAccountAsync(contextAccessor, token);

      if (!hasAccount || statusCode != HttpStatusCode.OK || account is null) {
         return (hasAccount, statusCode, account, null, message);
      }

      if (!account.ProfileComplete) {
        _log.ForContext("account", account)
          .Warning("incomplete profile");

        return (false, HttpStatusCode.BadRequest, account, null, "account profile is not complete");
      }

      var site = await _context.Sites.SingleOrDefaultAsync(x => x.Id == id, token);

      if (site.AccountFk != account.Id){
        if (account.Access == AccessLevels.elevated) {
          _log.ForContext("site", id)
              .ForContext("account", account)
              .Information("elevated access to external item");

          return (true, HttpStatusCode.OK, account, site, string.Empty);
        }

        _log.ForContext("account", account)
            .Warning("access to external item not permitted");

        return (false, HttpStatusCode.Unauthorized, null, null, "access to external item not permitted");
      }

      return (true, HttpStatusCode.OK, account, site, string.Empty);
    }
  }
}
