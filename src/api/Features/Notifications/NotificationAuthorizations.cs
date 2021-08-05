using System.Security.Claims;
using api.Infrastructure;
using MediatR.Behaviors.Authorization;
using Microsoft.AspNetCore.Http;

namespace api.Features {
  public class GetNotificationsAuthorizer : AbstractRequestAuthorizer<GetNotifications.Query> {
    private readonly IHttpContextAccessor _context;

    public GetNotificationsAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(GetNotifications.Query request) =>
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
  }

  public class UpdateNotificationAuthorizer : AbstractRequestAuthorizer<UpdateNotification.Command> {
    private readonly IHttpContextAccessor _context;

    public UpdateNotificationAuthorizer(IHttpContextAccessor context) {
      _context = context;
    }
    public override void BuildPolicy(UpdateNotification.Command request) {
      UseRequirement(new MustHaveAccount(_context.HttpContext?.User ?? new ClaimsPrincipal()));
      UseRequirement(new MustOwnNotification(request.Input.Id));
    }
  }
}
