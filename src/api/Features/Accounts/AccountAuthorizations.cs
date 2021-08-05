using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features {
  public class UpdateAccountAuthorizer : AbstractRequestAuthorizer<UpdateAccount.Command> {
    private readonly IHttpContextAccessor _context;

    public UpdateAccountAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }

    public override void BuildPolicy(UpdateAccount.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnAccount(request.Input.Id));
    }
  }

  public class GetMyAccountAuthorizer : AbstractRequestAuthorizer<GetMyAccount.Query> {
    private readonly IHttpContextAccessor _context;

    public GetMyAccountAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(GetMyAccount.Query request) =>
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
  }

  public class GetAccountByIdAuthorizer : AbstractRequestAuthorizer<GetAccountById.Query> {
    private readonly IHttpContextAccessor _context;

    public GetAccountByIdAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(GetAccountById.Query request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnAccount(request.AccountId));
    }
  }
}
