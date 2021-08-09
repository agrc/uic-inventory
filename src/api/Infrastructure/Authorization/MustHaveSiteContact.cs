using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Features;
using MediatR.Behaviors.Authorization;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Infrastructure {
  public static class RequiredContactTypes {
    public static IReadOnlyCollection<ContactTypes> Types => new List<ContactTypes> { ContactTypes.owner_operator, ContactTypes.facility_owner, ContactTypes.legal_rep };
  }
  public class MustHaveSiteContact : IAuthorizationRequirement {
    public int SiteId { get; set; }

    private class Handler : IAuthorizationHandler<MustHaveSiteContact> {
      private readonly ILogger _log;
      private readonly IAppDbContext _context;
      public Handler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
      public async Task<AuthorizationResult> Handle(
        MustHaveSiteContact requirement,
        CancellationToken token = default) {
        var site = await _context.Sites
          .Include(x => x.Contacts)
          .SingleOrDefaultAsync(x => x.Id == requirement.SiteId, token);

        if (site.Contacts.Count < 1) {
          return AuthorizationResult.Fail("This site is missing a contact.");
        }

        var contactTypes = site.Contacts.Select(x => x.ContactType).ToList();

        if (!RequiredContactTypes.Types.Any(x => contactTypes.Contains(x))) {
          return AuthorizationResult.Fail("This site is missing a contact of the type owner, operator or legal representative.");
        }

        return AuthorizationResult.Succeed();
      }
    }
  }
}
