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
public class GetSignatureAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetInventorySignature.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetInventorySignature.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Submitted, InventoryStatus.UnderReview, InventoryStatus.Approved, InventoryStatus.Authorized, InventoryStatus.Completed]));
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class SubmitInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<SubmitInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(SubmitInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnSite(request.SiteId));
        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveCompleteInventory(request.InventoryId));
        UseRequirement(new MustHaveCompleteProfile());
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
public class RejectInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<RejectInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(RejectInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Submitted, InventoryStatus.UnderReview]));
        UseRequirement(new MustHaveReviewableInventory(request.InventoryId));
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class DownloadInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<DownloadInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(DownloadInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class UnderReviewInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UnderReviewInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UnderReviewInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Submitted, InventoryStatus.UnderReview]));
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class ApproveInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<ApproveInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(ApproveInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Submitted, InventoryStatus.UnderReview]));
        UseRequirement(new MustHaveNoFlaggedIssues());
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class AuthorizeInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<AuthorizeInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(AuthorizeInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Approved]));
        UseRequirement(new MustHaveInventoryAdminAdditions());
        UseRequirement(new MustHaveNoFlaggedIssues());
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class CompleteInventoryAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<CompleteInventory.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(CompleteInventory.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
        UseRequirement(new MustOwnInventory(request.InventoryId));
        UseRequirement(new MustHaveInventoryStatus(request.InventoryId, [InventoryStatus.Authorized]));
        UseRequirement(new MustHaveInventoryAdminAdditions());
        UseRequirement(new MustHaveNoFlaggedIssues());
        UseRequirement(new MustHaveCompleteProfile());
    }
}
public class UpdateGroundWaterContactsAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UpdateGroundWaterContacts.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UpdateGroundWaterContacts.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
    }
}
