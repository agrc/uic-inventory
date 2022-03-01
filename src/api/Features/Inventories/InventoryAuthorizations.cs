using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features {
  public class GetInventoriesBySiteAuthorizer : AbstractRequestAuthorizer<GetInventoriesBySite.Query> {
    private readonly IHttpContextAccessor _context;

    public GetInventoriesBySiteAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }

    public override void BuildPolicy(GetInventoriesBySite.Query request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustOwnSite(request.SiteId));
    }
  }

  public class GetInventoryByIdAuthorizer : AbstractRequestAuthorizer<GetInventoryById.Query> {
    private readonly IHttpContextAccessor _context;

    public GetInventoryByIdAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }

    public override void BuildPolicy(GetInventoryById.Query request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustOwnSite(request.SiteId));
      UseRequirement(new MustHaveCompleteSite());
    }
  }

  public class CreateInventoryAuthorizer : AbstractRequestAuthorizer<CreateInventory.Command> {
    private readonly IHttpContextAccessor _context;

    public CreateInventoryAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(CreateInventory.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustOwnSite(request.SiteId));
      UseRequirement(new MustHaveCompleteSite());
    }
  }

  public class UpdateInventoryAuthorizer : AbstractRequestAuthorizer<UpdateInventory.Command> {
    private readonly IHttpContextAccessor _context;

    public UpdateInventoryAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(UpdateInventory.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustHaveElevatedAccount());
    }
  }

  public class SubmitInventoryAuthorizer : AbstractRequestAuthorizer<SubmitInventory.Command> {
    private readonly IHttpContextAccessor _context;

    public SubmitInventoryAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(SubmitInventory.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnSite(request.SiteId));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustHaveEditableSiteStatus());
      UseRequirement(new MustHaveCompleteInventory(request.InventoryId));
    }
  }

  public class DeleteInventoryAuthorizer : AbstractRequestAuthorizer<DeleteInventory.Command> {
    private readonly IHttpContextAccessor _context;

    public DeleteInventoryAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(DeleteInventory.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnSite(request.SiteId));
      UseRequirement(new MustOwnInventory(request.InventoryId));
      UseRequirement(new MustHaveCompleteProfile());
      UseRequirement(new MustHaveEditableSiteStatus());
      UseRequirement(new MustHaveEditableInventoryStatus());
    }
  }
    }
  }
}
