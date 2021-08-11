using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features {
  public class GetSitesAuthorizer : AbstractRequestAuthorizer<GetSites.Query> {
    private readonly IHttpContextAccessor _context;

    public GetSitesAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(GetSites.Query request) =>
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
  }

  public class GetSiteByIdAuthorizer : AbstractRequestAuthorizer<GetSiteById.Query> {
    private readonly IHttpContextAccessor _context;

    public GetSiteByIdAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }

    public override void BuildPolicy(GetSiteById.Query request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustOwnSite(request.SiteId));
    }
  }

  public class CreateSiteAuthorizer : AbstractRequestAuthorizer<CreateSite.Command> {
    private readonly IHttpContextAccessor _context;

    public CreateSiteAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(CreateSite.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustHaveCompleteProfile());
    }
  }

  public class UpdateSiteAuthorizer : AbstractRequestAuthorizer<UpdateSite.Command> {
    private readonly IHttpContextAccessor _context;

    public UpdateSiteAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(UpdateSite.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnSite(request.Site.SiteId));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustHaveEditableSiteStatus());
    }
  }

  public class DeleteSiteAuthorizer : AbstractRequestAuthorizer<DeleteSite.Command> {
    private readonly IHttpContextAccessor _context;

    public DeleteSiteAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(DeleteSite.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnSite(request.SiteId));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustHaveEditableSiteStatus());
    }
  }
}
