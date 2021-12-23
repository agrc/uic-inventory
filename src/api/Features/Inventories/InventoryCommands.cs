using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Serilog;

namespace api.Features {
  public static class CreateInventory {
    public class Command : IRequest<Inventory> {
      public Command(InventoryCreationInput input) {
        AccountId = input.AccountId;
        SiteId = input.SiteId;
        SubClass = input.SubClass;
        OrderNumber = input.OrderNumber;
      }

      public int AccountId { get; init; }
      public int SiteId { get; init; }
      public int OrderNumber { get; init; }
      public int SubClass { get; init; }
      public DateTime? CreatedOn { get; } = DateTime.UtcNow;
    }
    public class Handler : IRequestHandler<Command, Inventory> {
      private readonly IAppDbContext _context;
      private readonly IPublisher _publisher;
      private readonly ILogger _log;

      public Handler(IAppDbContext context, IPublisher publisher, ILogger log) {
        _context = context;
        _publisher = publisher;
        _log = log;
      }
      public async Task<Inventory> Handle(Command message, CancellationToken cancellationToken) {
        _log.ForContext("input", message)
          .ForContext("verb", "POST")
          .Debug("/api/inventory");

        var inventory = new Inventory {
          AccountFk = message.AccountId,
          SiteFk = message.SiteId,
          OrderNumber = message.OrderNumber,
          SubClass = message.SubClass,
        };

        var result = await _context.Inventories.AddAsync(inventory, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        inventory.Id = result.Entity.Id;

        // await _publisher.Publish(new InventoryNotifications.EditNotification(Inventory.Id), cancellationToken);

        return inventory;
      }
    }
  }
}
