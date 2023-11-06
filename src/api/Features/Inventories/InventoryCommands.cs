using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class CreateInventory {
    public class Command(InventoryCreationInput input) : IRequest<Inventory> {
        public int AccountId { get; init; } = input.AccountId;
        public int SiteId { get; init; } = input.SiteId;
        public int OrderNumber { get; init; } = input.OrderNumber;
        public int SubClass { get; init; } = input.SubClass;
        public DateTime? CreatedOn { get; } = DateTime.UtcNow;
    }
    public class Handler(IAppDbContext context, IPublisher publisher, ILogger log) : IRequestHandler<Command, Inventory> {
        private readonly IAppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;

        public async Task<Inventory> Handle(Command message, CancellationToken cancellationToken) {
            _log.ForContext("input", message)
              .Debug("Creating inventory");

            var inventory = new Inventory {
                AccountFk = message.AccountId,
                SiteFk = message.SiteId,
                OrderNumber = message.OrderNumber,
                SubClass = message.SubClass,
            };

            var result = await _context.Inventories.AddAsync(inventory, cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            inventory.Id = result.Entity.Id;

            await _publisher.Publish(new InventoryNotifications.EditNotification(inventory.Id), cancellationToken);

            return inventory;
        }
    }
}
public static class UpdateInventory {
    public class Command(InventoryMutationInput input) : IRequest<Inventory> {
        public int AccountId { get; init; } = input.AccountId;
        public int SiteId { get; init; } = input.SiteId;
        public int InventoryId { get; init; } = input.InventoryId;
        public int? SubClass { get; init; } = input.SubClass;
        public string? Edocs { get; set; } = input.Edocs;
        public string? Flagged { get; set; } = input.Flagged;
        public int? OrderNumber { get; set; } = input.OrderNumber;
    }
    public class Handler(IAppDbContext context, HasRequestMetadata metadata, ILogger log) : IRequestHandler<Command, Inventory> {
        private readonly IAppDbContext _context = context;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly ILogger _log = log;

        public async Task<Inventory> Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Updating inventory");

            var inventory = await _context.Inventories
              .FirstAsync(s => s.Id == request.InventoryId, cancellationToken);

            if (request.SubClass.HasValue) {
                inventory.SubClass = request.SubClass.Value;
            }

            if (request.Edocs != null) {
                inventory.Edocs = request.Edocs;
            }

            if (request.Edocs?.Length == 0) {
                inventory.Edocs = null;
            }

            if (request.Flagged != null) {
                inventory.Flagged = $"Flagged by: {_metadata?.Account?.FirstName ?? "Unknown"} {_metadata?.Account?.LastName ?? "Actor"} {request.Flagged}";
            }

            if (request.Flagged?.Length == 0) {
                inventory.Flagged = null;
            }

            if (request.OrderNumber.HasValue) {
                inventory.OrderNumber = request.OrderNumber.Value;
            }

            await _context.SaveChangesAsync(cancellationToken);

            return inventory;
        }
    }
}
public static class SubmitInventory {
    public class Command(InventorySubmissionInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
        public string Signature { get; set; } = input.Signature;
    }

    public class Handler(IAppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly IAppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Submitting Inventory");

            if (string.IsNullOrEmpty(request.Signature)) {
                throw new Exception("Signature is required");
            }

            var inventory = await _context.Inventories
              .FirstAsync(s => s.Id == request.InventoryId, cancellationToken);

            inventory.SubmittedOn = DateTime.UtcNow;
            inventory.Signature = request.Signature;

            //? TODO: may already be tracked and all .updates are irrelevant (https://learn.microsoft.com/en-us/ef/core/change-tracking/explicit-tracking)
            _context.Inventories.Update(inventory);

            //! TODO: needs requirements

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.InventoryId), cancellationToken);
            await _publisher.Publish(new InventoryNotifications.SubmitNotification(_metadata.Site, _metadata.Inventory, _metadata.Account), cancellationToken);

            return;
        }
    }
}
public static class DeleteInventory {
    public class Command(InventoryDeletionInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(IAppDbContext context, ILogger log, IPublisher publisher) : IRequestHandler<Command> {
        private readonly IAppDbContext _context = context;
        private readonly ILogger _log = log;
        private readonly IPublisher _publisher = publisher;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Deleting inventory");

            var inventory = await _context.Inventories
              .Include(w => w.Wells)
              .FirstAsync(s => s.Id == request.InventoryId, cancellationToken);

            _context.Inventories.Remove(inventory);

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.DeleteNotification(inventory), cancellationToken);

            return;
        }
    }
}
public static class RejectInventory {
    public class Command(InventoryDeletionInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(IAppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly IAppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Rejecting inventory");

            var inventory = await _context.Inventories
              .Include(i => i.Wells)
              .FirstOrDefaultAsync(s => s.Id == request.InventoryId, cancellationToken) ?? throw new Exception("R01:Inventory not found");

            _context.Inventories.Remove(inventory);

            var site = await _context.Sites
              .Include(s => s.Inventories)
              .Include(s => s.Contacts)
              .FirstAsync(s => s.Id == request.SiteId, cancellationToken);

            var contacts = site.Contacts.Select(x => x.Email)
              .Distinct()
              .ToList();

            if ((site.Inventories.Count - 1) == 0) {
                _context.Sites.Remove(site);
            }

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.RejectNotification(site, inventory, _metadata.Account, contacts), cancellationToken);
            await _publisher.Publish(new InventoryNotifications.DeleteNotification(inventory), cancellationToken);

            return;
        }
    }
}
