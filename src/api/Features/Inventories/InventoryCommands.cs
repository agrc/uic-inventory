using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using Google.Apis.Auth.OAuth2;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Net.Http.Headers;
using Serilog;

namespace api.Features;
public static class CreateInventory {
    public class Command(InventoryCreationInput input) : IRequest<Inventory> {
        public int AccountId { get; init; } = input.AccountId;
        public int SiteId { get; init; } = input.SiteId;
        public string? OrderNumber { get; init; } = input.OrderNumber;
        public int SubClass { get; init; } = input.SubClass;
        public DateTime? CreatedOn { get; } = DateTime.UtcNow;
    }
    public class Handler(AppDbContext context, IPublisher publisher, ILogger log) : IRequestHandler<Command, Inventory> {
        private readonly AppDbContext _context = context;
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
        public string? OrderNumber { get; set; } = input.OrderNumber;
        public string? SiteIdentifier { get; init; } = input.SiteIdentifier;
    }
    public class Handler(AppDbContext context, HasRequestMetadata metadata, ILogger log) : IRequestHandler<Command, Inventory> {
        private readonly AppDbContext _context = context;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly ILogger _log = log;

        public async Task<Inventory> Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Updating inventory");

            var inventory = await _context.Inventories
              .Include(x => x.Site)
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

            if (request.OrderNumber != null) {
                inventory.OrderNumber = request.OrderNumber;
            }

            if (request.OrderNumber?.Length == 0) {
                inventory.OrderNumber = null;
            }

            if (request.SiteIdentifier != null && inventory.Site is not null) {
                inventory.Site.SiteId = request.SiteIdentifier;
            }

            if (request.SiteIdentifier?.Length == 0 && inventory.Site is not null) {
                inventory.Site.SiteId = null;
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

    public class Handler(AppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
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

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.InventoryId), cancellationToken);
            await _publisher.Publish(new InventoryNotifications.SubmitNotification(_metadata.Site, _metadata.Inventory, _metadata.Account), cancellationToken);

            return;
        }
    }
}
public static class DeleteInventory {
    public class Command(ExistingInventoryInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(AppDbContext context, ILogger log, IPublisher publisher) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
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
    public class Command(ExistingInventoryInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(AppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
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
public static class DownloadInventory {
    public class Command(ExistingInventoryInput input) : IRequest<HttpContent> {
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public record ReportPayload(InventoryPayload inventory, IEnumerable<ContactPayload> contacts, IEnumerable<string> cloudFiles, AccountPayload approver);
    public class Handler(AppDbContext context, IHttpClientFactory clientFactory, IConfiguration configuration, ILogger log,
            HasRequestMetadata metadata
    ) : IRequestHandler<Command, HttpContent> {
        private readonly ILogger _log = log;
        private readonly AppDbContext _context = context;
        private readonly HttpClient _client = clientFactory.CreateClient("google");
        private readonly string _functionUrl = configuration.GetSection("ReportFunction").GetValue<string>("Url") ?? string.Empty;
        private readonly HasRequestMetadata _metadata = metadata;

        public async Task<HttpContent> Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Downloading inventory");

            var site = await _context.Sites
                .Include(c => c.Contacts)
                .Include(x => x.Inventories.Where(i => i.Id == request.InventoryId))
                .ThenInclude(x => x.Wells)
                .ThenInclude(x => x.WaterSystemContacts)
                .AsSplitQuery()
                .Where(s => s.Id == request.SiteId)
                .SingleAsync(cancellationToken);

            var inventoryPayload = new InventoryPayload(site.Inventories.Single(), site);

            string decodeFile(string details) {
                var wellRange = details[6..details.IndexOf('_')];

                return GetWellFiles.DecodeFilePath(site.Id, inventoryPayload.Id, wellRange, details[(details.IndexOf('_') + 1)..]).Item2;
            }

            var cloudFiles = inventoryPayload.Wells
                .SelectMany(well => new[] { well.ConstructionDetails, well.InjectateCharacterization, well.HydrogeologicCharacterization })
                .Where(details => (details ?? "").StartsWith("file::"))
                .Select(details => decodeFile(details!))
                .Distinct();

            var payload = new ReportPayload(inventoryPayload, site.Contacts.Select(x => new ContactPayload(x)), cloudFiles, new AccountPayload(_metadata.Account));

            _log.Debug("Requesting Application Default Credentials");

            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development") {
                var credential = await GoogleCredential.GetApplicationDefaultAsync(cancellationToken);
                var oidcToken = await credential.GetOidcTokenAsync(OidcTokenOptions.FromTargetAudience(_functionUrl), cancellationToken);
                var idToken = await oidcToken.GetAccessTokenAsync(cancellationToken);

                _client.DefaultRequestHeaders.Add(HeaderNames.Authorization, $"Bearer {idToken}");
            }

            var response = await _client.PostAsJsonAsync(_functionUrl, payload, cancellationToken);

            response.EnsureSuccessStatusCode();

            return response.Content;
        }
    }
}
public static class ApproveInventory {
    public class Command(ExistingInventoryInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(AppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Approving inventory");

            var inventory = await _context.Inventories
              .FirstAsync(s => s.Id == request.InventoryId, cancellationToken);

            inventory.ApprovedOn = DateTime.UtcNow;
            inventory.ApprovedByAccount = _metadata.Account;

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.InventoryId), cancellationToken);
            await _publisher.Publish(new InventoryNotifications.ApproveNotification(inventory.SiteFk, inventory.Id, _metadata.Account), cancellationToken);

            return;
        }
    }
}
public static class UnderReviewInventory {
    public class Command(ExistingInventoryInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(AppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Setting inventory as under review");

            var inventory = await _context.Inventories
              .FirstAsync(s => s.Id == request.InventoryId, cancellationToken);

            inventory.UnderReviewOn = DateTime.UtcNow;
            inventory.UnderReviewByAccount = _metadata.Account;

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.InventoryId), cancellationToken);
            await _publisher.Publish(new InventoryNotifications.UnderReviewNotification(inventory.SiteFk, inventory.Id, _metadata.Account), cancellationToken);

            return;
        }
    }
}
public static class AuthorizeInventory {
    public class Command(ExistingInventoryInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(AppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Authorizing Inventory");

            var inventory = await _context.Inventories
              .FirstAsync(s => s.Id == request.InventoryId, cancellationToken);

            inventory.AuthorizedOn = DateTime.UtcNow;
            inventory.AuthorizedByAccount = _metadata.Account;

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.InventoryId), cancellationToken);
            await _publisher.Publish(new InventoryNotifications.AuthorizeNotification(inventory.SiteFk, inventory.Id, _metadata.Account), cancellationToken);

            return;
        }
    }
}
public static class CompleteInventory {
    public class Command(ExistingInventoryInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public int InventoryId { get; set; } = input.InventoryId;
    }

    public class Handler(AppDbContext context,
            IPublisher publisher,
            HasRequestMetadata metadata,
            ILogger log) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Completing inventory");

            var inventory = await _context.Inventories
              .FirstAsync(s => s.Id == request.InventoryId, cancellationToken);

            inventory.CompletedOn = DateTime.UtcNow;
            inventory.CompletedByAccount = _metadata.Account;

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new InventoryNotifications.EditNotification(request.InventoryId), cancellationToken);
            await _publisher.Publish(new InventoryNotifications.CompleteNotification(inventory.SiteFk, inventory.Id, _metadata.Account), cancellationToken);

            return;
        }
    }
}
