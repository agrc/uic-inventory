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
        UseRequirement(new MustHaveCompleteProfile());
        UseRequirement(new MustHaveCompleteInventory(request.InventoryId));
    }
}
public class DeleteInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DeleteInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DeleteInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveEditableInventoryStatus());
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class RejectInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DeleteInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DeleteInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveReviewableInventory(request.InventoryId));
    }
}
public class DownloadInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DownloadInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DownloadInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
    }
}
public class UnderReviewInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UnderReviewInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UnderReviewInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Submitted, InventoryStatus.UnderReview]));
    }
}
public class ApproveInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<ApproveInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(ApproveInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Submitted, InventoryStatus.UnderReview]));
        UseRequirement(new MustHaveNoFlaggedIssues());
    }
}

public class AuthorizeInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<AuthorizeInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(AuthorizeInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Approved]));
        UseRequirement(new MustHaveInventoryAdminAdditions());
        UseRequirement(new MustHaveNoFlaggedIssues());
    }
}
public class CompleteInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<CompleteInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(CompleteInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Authorized]));
        UseRequirement(new MustHaveInventoryAdminAdditions());
        UseRequirement(new MustHaveNoFlaggedIssues());
    }
}
