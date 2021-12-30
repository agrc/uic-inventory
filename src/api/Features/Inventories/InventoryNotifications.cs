using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class InventoryNotifications {
    public class EditNotification : INotification {
      public EditNotification(int inventoryId) {
        Id = inventoryId;
      }

      public int Id { get; }
    }

    public class EditNotificationHandler : INotificationHandler<EditNotification> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;


      public EditNotificationHandler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
      private static bool GetWellContactStatus(Inventory entity) {
        foreach (var well in entity.Wells) {
          // if (well.)
        }

        return false;
      }

      private static bool GetPaymentStatus(Inventory entity) {
        IReadOnlyList<int> subClasses = new List<int> { -1, 5047, 5002, 5101, 5026 };

        return entity.OrderNumber >= 1000000 && entity.OrderNumber <= 9999999 && subClasses.Contains(entity.SubClass);
      }

      private static bool GetLocationStatus(Inventory entity) {
        var hasAtLeastOneWell = entity.Wells.Count > 0;

        if (!hasAtLeastOneWell) {
          return false;
        }

        return entity.Wells.All(x =>
          !string.IsNullOrEmpty(x.WellName) &&
          !string.IsNullOrEmpty(x.Status) && x.Quantity > 0 &&
          !string.IsNullOrEmpty(x.Geometry)
        );
      }
      private static bool GetWellDetailsStatus(Inventory entity) {
        var hasAtLeastOneWell = entity.Wells.Count > 0;

        if (!hasAtLeastOneWell) {
          return false;
        }

        var hasConstructionDetails = entity.Wells.All(x => !string.IsNullOrEmpty(x.ConstructionDetails));

        if (entity.Wells.Any(x => x.SubClass == 5002)) {
          var serHasInjectate = entity.Wells
            .Where(x => x.SubClass == 5002)
            .Any(w => !string.IsNullOrEmpty(w.InjectateCharacterization));

          return hasConstructionDetails && serHasInjectate;
        }

        return hasConstructionDetails;
      }
      private static bool GetSignatureStatus(Inventory entity) => !string.IsNullOrEmpty(entity.Signature);
      private static InventoryStatus GetInventoryStatus(Inventory entity) =>
        entity.ContactStatus && entity.DetailStatus && entity.LocationStatus ?
          InventoryStatus.Complete : InventoryStatus.Incomplete;
      public async Task Handle(EditNotification notification, CancellationToken token) {
        _log.ForContext("notification", notification)
          .Debug("Handling Inventory notification");

        var entity = await _context.Inventories
          .Include(x => x.Wells)
          .SingleOrDefaultAsync(s => s.Id == notification.Id, token);

        if (entity == null) {
          return;
        }

        entity.PaymentStatus = GetPaymentStatus(entity);
        entity.LocationStatus = GetLocationStatus(entity);
        entity.ContactStatus = GetWellContactStatus(entity);
        entity.DetailStatus = GetWellDetailsStatus(entity);
        entity.SignatureStatus = GetSignatureStatus(entity);

        entity.Status = GetInventoryStatus(entity);

        _log.ForContext("inventory", entity)
          .Debug("Updating inventory status");

        await _context.SaveChangesAsync(token);
      }
    }
  }
}
