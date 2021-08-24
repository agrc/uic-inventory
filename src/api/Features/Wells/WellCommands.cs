using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features {
  public static class CreateWell {
    public class Command : IRequest<Well> {
      public Command(WellInput input) {
        AccountId = input.AccountId;
        SiteId = input.SiteId;
        SubClass = input.SubClass;
        OrderNumber = input.OrderNumber;
      }

      public int AccountId { get; init; }
      public int SiteId { get; init; }
      public int OrderNumber { get; init; }
      public int SubClass { get; init; }
    }
    public class Handler : IRequestHandler<Command, Well> {
      private readonly IAppDbContext _context;
      private readonly IPublisher _publisher;
      private readonly ILogger _log;

      public Handler(IAppDbContext context, IPublisher publisher, ILogger log) {
        _context = context;
        _publisher = publisher;
        _log = log;
      }
      public async Task<Well> Handle(Command message, CancellationToken cancellationToken) {
        _log.ForContext("input", message)
          .ForContext("verb", "POST")
          .Debug("/api/well");

        var well = new Well {
          AccountFk = message.AccountId,
          SiteFk = message.SiteId,
          OrderNumber = message.OrderNumber,
          SubClass = message.SubClass,
        };

        var result = await _context.Wells.AddAsync(well, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        well.Id = result.Entity.Id;

        // await _publisher.Publish(new WellNotifications.EditNotification(well.Id), cancellationToken);

        return well;
      }
    }
  }
}
