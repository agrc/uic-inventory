using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features;
public class GetSitesAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetSites.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetSites.Query request) =>
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
}

public class GetSiteByIdAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetSiteById.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetSiteById.Query request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class CreateSiteAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<CreateSite.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(CreateSite.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class UpdateSiteAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UpdateSite.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UpdateSite.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.Site.SiteId));
        UseRequirement(new MustHaveEditableSiteStatus());
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class DeleteSiteAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DeleteSite.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DeleteSite.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveEditableSiteStatus());
        UseRequirement(new MustHaveCompleteProfile());
    }
}
