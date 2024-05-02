using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features;
public class GetSiteContactsAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetSiteContacts.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetSiteContacts.Query request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));

        UseRequirement(new MustOwnSite(request.SiteId));
    }
}

public class CreateContactAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<CreateContact.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(CreateContact.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveEditableSiteStatus());
    }
}

public class CreateSerContactAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<CreateSerContact.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(CreateSerContact.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.SiteId));

        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustBeSerInventory(request.InventoryId));
    }
}

public class DeleteContactAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DeleteContact.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DeleteContact.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.SiteId));

        UseRequirement(new MustHaveEditableSiteStatus());
    }
}
