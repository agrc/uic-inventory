using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features;

public class GetWellByIdAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetWellById.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetWellById.Query request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveCompleteSite());

        UseRequirement(new MustOwnInventory(request.InventoryId));
    }
}

public class CreateWellAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<CreateWell.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(CreateWell.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.Input.SiteId));
        UseRequirement(new MustHaveCompleteSite());

        UseRequirement(new MustOwnInventory(request.Input.InventoryId));
        UseRequirement(new MustHaveEditableInventoryStatus());
    }
}

public class UpdateWellAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UpdateWell.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UpdateWell.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustHaveCompleteSite());

        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveEditableInventoryStatus());
    }
}

public class UpdateWellDetailsAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UpdateWellDetails.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UpdateWellDetails.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.Wells.SiteId));
        UseRequirement(new MustHaveCompleteSite());

        UseRequirement(new MustOwnInventory(request.Wells.InventoryId));
        UseRequirement(new MustHaveEditableInventoryStatus());
    }
}

public class DeleteWellAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DeleteWell.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DeleteWell.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.SiteId));

        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveEditableInventoryStatus());

        UseRequirement(new MustOwnWell(request.WellId));
    }
}

public class GetWellFilesAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetWellFiles.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetWellFiles.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());

        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustOwnInventory(request.InventoryId));
    }
}
