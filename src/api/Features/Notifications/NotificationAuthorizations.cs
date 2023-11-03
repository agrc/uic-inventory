using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features;
public class GetNotificationsAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<GetNotifications.Query> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(GetNotifications.Query request) =>
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
}

public class UpdateNotificationAuthorizer(IHttpContextAccessor context) : AbstractRequestAuthorizer<UpdateNotification.Command> {
    private readonly IHttpContextAccessor _context = context;

    public override void BuildPolicy(UpdateNotification.Command request) {
        UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
        UseRequirement(new MustOwnNotification(request.Input.Id));
    }
}
