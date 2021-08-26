using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class CreateWell {
    public class Command : IRequest<Well> {
      public Command(WellInput input) {
        Input = input;
      }

      public WellInput Input { get; }
    }
    public class Handler : IRequestHandler<Command, Well> {
      private readonly IAppDbContext _context;
      private readonly IPublisher _publisher;
      private readonly ILogger _log;
      private readonly HasRequestMetadata _metadata;

      public Handler(
        IAppDbContext context,
        IPublisher publisher,
        HasRequestMetadata metadata,
        ILogger log) {
        _context = context;
        _publisher = publisher;
        _log = log;
        _metadata = metadata;
      }
      public async Task<Well> Handle(Command message, CancellationToken cancellationToken) {
        _log.ForContext("input", message)
          .ForContext("verb", "POST")
          .Debug("/api/well");

        var well = new Well {
          AccountFk = message.Input.AccountId,
          SiteFk = message.Input.SiteId,
          InventoryFk = message.Input.InventoryId,
          WellName = message.Input.Construction,
          Status = message.Input.Status,
          Description = message.Input.Description,
          Quantity = message.Input.Quantity,
          Geometry = message.Input.Geometry,
          SubClass = _metadata.Inventory.SubClass,
          RemediationType = message.Input.RemediationType,
          RemediationDescription = message.Input.RemediationDescription,
          RemediationProjectId = message.Input.RemediationProjectId,
        };

        var result = await _context.Wells.AddAsync(well, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        well.Id = result.Entity.Id;

        // await _publisher.Publish(new WellNotifications.EditNotification(well.Id), cancellationToken);

        return well;
      }
    }
  }

  public static class DeleteWell {
    public class Command : IRequest {
      public Command(WellInput input) {
        AccountId = input.AccountId;
        SiteId = input.SiteId;
        InventoryId = input.InventoryId;
        WellId = input.WellId;
      }

      public int AccountId { get; set; }
      public int SiteId { get; set; }
      public int InventoryId { get; }
      public int WellId { get; set; }
    }

    public class Handler : IRequestHandler<Command> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;

      public Handler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
      async Task<Unit> IRequestHandler<Command, Unit>.Handle(Command request, CancellationToken cancellationToken) {
        var well = await _context.Wells
          .FirstAsync(s => s.Id == request.WellId, cancellationToken);

        _context.Wells.Remove(well);

        //! TODO: create requirement that well cannot be deleted when authorized status

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
      }
    }
  }
}
