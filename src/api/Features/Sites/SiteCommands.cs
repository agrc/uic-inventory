using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class CreateSite {
    public class Command(SiteInput input) : IRequest<Site> {
        public int AccountId { get; init; } = input.AccountId;
        public string? Name { get; init; } = input.Name;
        public string? Ownership { get; init; } = input.Ownership;
        public string? Naics { get; init; } = input.NaicsPrimary;
        public string? NaicsTitle { get; init; } = input.NaicsTitle;
    }
    public class Handler(AppDbContext context, IPublisher publisher, ILogger log) : IRequestHandler<Command, Site> {
        private readonly AppDbContext _context = context;
        private readonly IPublisher _publisher = publisher;
        private readonly ILogger _log = log;

        public async Task<Site> Handle(Command message, CancellationToken cancellationToken) {
            _log.ForContext("input", message)
              .Debug("Creating site");

            var site = new Site {
                AccountFk = message.AccountId,
                Name = message.Name,
                Ownership = message.Ownership,
                NaicsPrimary = Convert.ToInt32(message.Naics),
                NaicsTitle = message.NaicsTitle
            };

            var result = await _context.Sites.AddAsync(site, cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            site.Id = result.Entity.Id;

            await _publisher.Publish(new SiteNotifications.EditNotification(site.Id), cancellationToken);

            return site;
        }
    }
}

public static class UpdateSite {
    public class Command(SiteInput input) : IRequest<Site> {
        public SiteInput Site { get; } = input;
    }

    public class Handler(AppDbContext context, HasRequestMetadata metadata, IPublisher publisher, ILogger log) : IRequestHandler<Command, Site> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;
        private readonly HasRequestMetadata _metadata = metadata;
        private readonly IPublisher _publisher = publisher;

        public async Task<Site> Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Updating site");
            //! TODO: create requirement that site cannot be edited when authorized status

            var site = _metadata.Site;

            request.Site.Update(site);

            await _context.SaveChangesAsync(cancellationToken);

            await _publisher.Publish(new SiteNotifications.EditNotification(site.Id), cancellationToken);

            return site;
        }
    }
}

public static class DeleteSite {
    public class Command(SiteInput input) : IRequest {
        public int AccountId { get; set; } = input.AccountId;
        public int SiteId { get; set; } = input.SiteId;
        public string? Address { get; set; }
        public string? Geometry { get; set; }
    }

    public class Handler(AppDbContext context, IPublisher publisher, ILogger log) : IRequestHandler<Command> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;
        private readonly IPublisher _publisher = publisher;

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
            _log.ForContext("input", request)
              .Debug("Deleting site");

            var connectedSite = await _context.Sites
              .Include(s => s.Contacts)
              .Include(i => i.Inventories)
              .Include(w => w.Wells)
              .FirstAsync(s => s.Id == request.SiteId, cancellationToken);

            _context.Sites.Remove(connectedSite);

            await _context.SaveChangesAsync(cancellationToken);
            await _publisher.Publish(new SiteNotifications.DeleteNotification(request.SiteId), cancellationToken);

            return;
        }
    }
}
