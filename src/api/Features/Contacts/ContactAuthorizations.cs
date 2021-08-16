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

  public class CreateContactAuthorizer : AbstractRequestAuthorizer<CreateContact.Command> {
    private readonly IHttpContextAccessor _context;

    public CreateContactAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(CreateContact.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnSite(request.SiteId));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustHaveEditableSiteStatus());
    }
  }

  public class DeleteContactAuthorizer : AbstractRequestAuthorizer<DeleteContact.Command> {
    private readonly IHttpContextAccessor _context;

    public DeleteContactAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(DeleteContact.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnSite(request.Input.SiteId));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustHaveEditableSiteStatus());
    }
  }
}
