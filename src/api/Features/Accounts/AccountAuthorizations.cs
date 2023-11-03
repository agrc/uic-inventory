using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features;
public class UpdateAccountAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UpdateAccount.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UpdateAccount.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnAccount(request.Input.Id));
    }
}

public class GetMyAccountAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetMyAccount.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetMyAccount.Query request) =>
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
}

public class GetAccountByIdAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetAccountById.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetAccountById.Query request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnAccount(request.AccountId));
    }
}

public class GetAllAccountsAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetAllAccounts.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetAllAccounts.Query request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
    }
}

public class AdminUpdateAccountAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<AdminUpdateAccount.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(AdminUpdateAccount.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveElevatedAccount());
    }
}
