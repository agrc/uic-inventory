using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features {
  public class GetSiteContactsAuthorizer : AbstractRequestAuthorizer<GetSiteContacts.Query> {
    private readonly IHttpContextAccessor _context;

    public GetSiteContactsAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(GetSiteContacts.Query request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnSite(request.SiteId));
    }
  }
}
