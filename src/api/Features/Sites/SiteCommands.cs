using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class CreateSite {
    public class Command : IRequest<Site> {
      public Command(SiteInput input) {
        AccountId = input.AccountId;
        Name = input.Name;
        Ownership = input.Ownership;
        Naics = input.NaicsPrimary;
        NaicsTitle = input.NaicsTitle;
      }

      public int AccountId { get; init; }
      public string? Name { get; init; }
      public string? Ownership { get; init; }
      public string? Naics { get; init; }
      public string? NaicsTitle { get; init; }
    }
    public class Handler : IRequestHandler<Command, Site> {
      private readonly IAppDbContext _context;
      private readonly IPublisher _publisher;
      private readonly ILogger _log;

      public Handler(IAppDbContext context, IPublisher publisher, ILogger log) {
        _context = context;
        _publisher = publisher;
        _log = log;
      }
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
    public class Command : IRequest<Site> {
      public Command(SiteInput input) {
        Site = input;
      }

      public SiteInput Site { get; }
    }

    public class Handler : IRequestHandler<Command, Site> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;
      private readonly HasRequestMetadata _metadata;
      private readonly IPublisher _publisher;

      public Handler(IAppDbContext context, HasRequestMetadata metadata, IPublisher publisher, ILogger log) {
        _context = context;
        _metadata = metadata;
        _publisher = publisher;
        _log = log;
      }
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
    public class Command : IRequest {
      public Command(SiteInput input) {
        AccountId = input.AccountId;
        SiteId = input.SiteId;
      }

      public int AccountId { get; set; }
      public int SiteId { get; set; }
      public string? Address { get; set; }
      public string? Geometry { get; set; }
    }

    public class Handler : IRequestHandler<Command> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;
      private readonly IPublisher _publisher;


      public Handler(IAppDbContext context, IPublisher publisher, ILogger log) {
        _context = context;
        _publisher = publisher;
        _log = log;
      }
      async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
        _log.ForContext("input", request)
          .Debug("Deleting site");

        var connectedSite = await _context.Sites
          .Include(s => s.Contacts)
          .Include(i => i.Inventories)
          .Include(w => w.Wells)
          .FirstAsync(s => s.Id == request.SiteId, cancellationToken);

        _context.Sites.Remove(connectedSite);

        //! TODO: create requirement that site cannot be deleted when authorized status

        await _context.SaveChangesAsync(cancellationToken);
        await _publisher.Publish(new SiteNotifications.DeleteNotification(request.SiteId), cancellationToken);

        return;
      }
    }
  }
}
