using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features;
public class SendEmailAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<SendEmail.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(SendEmail.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustHaveCompleteProfile());
    }
}
