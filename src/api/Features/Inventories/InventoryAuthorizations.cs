using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features;
public class GetInventoriesBySiteAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetInventoriesBySite.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetInventoriesBySite.Query request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class GetInventoryByIdAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetInventoryById.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetInventoryById.Query request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveCompleteSite());
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class CreateInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<CreateInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(CreateInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveCompleteSite());
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class UpdateInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UpdateInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UpdateInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class SubmitInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<SubmitInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(SubmitInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveCompleteInventory(request.InventoryId));
        UseRequirement(new MustHaveEditableSiteStatus());
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class DeleteInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DeleteInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DeleteInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveEditableSiteStatus());
        UseRequirement(new MustHaveEditableInventoryStatus());
        UseRequirement(new MustHaveCompleteProfile());
    }
}

public class RejectInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DeleteInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DeleteInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
    }
}

public class DownloadInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DownloadInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DownloadInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
    }
}
