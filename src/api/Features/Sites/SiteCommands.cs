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
        AccountId = input.Id;
        Name = input.Name;
        Ownership = input.Ownership;
        Naics = input.Naics;
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
          .ForContext("verb", "POST")
          .Debug("/api/site");

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
      public Command(SiteLocationInput input) {
        AccountId = input.Id;
        SiteId = input.SiteId;
        Address = input.Address;
        Geometry = input.Geometry;
      }

      public int AccountId { get; set; }
      public int SiteId { get; set; }
      public string? Address { get; set; }
      public string? Geometry { get; set; }
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
        var site = _metadata.Site;

        if (request.Address is not null) {
          site.Address = request.Address;
        }

        if (request.Geometry is not null) {
          site.Geometry = request.Geometry;
        }

        //! TODO: create requirement that site cannot be edited when authorized status

        await _context.SaveChangesAsync(cancellationToken);

        await _publisher.Publish(new SiteNotifications.EditNotification(site.Id), cancellationToken);

        return site;
      }
    }
  }

  public static class DeleteSite {
    public class Command : IRequest {
      public Command(SiteInput input) {
        AccountId = input.Id;
        SiteId = input.Id;
      }

      public int AccountId { get; set; }
      public int SiteId { get; set; }
      public string? Address { get; set; }
      public string? Geometry { get; set; }
    }

    public class Handler : IRequestHandler<Command> {
      private readonly IAppDbContext _context;
      private readonly ILogger _log;

      public Handler(IAppDbContext context, ILogger log) {
        _context = context;
        _log = log;
      }
      async Task<Unit> IRequestHandler<Command, Unit>.Handle(Command request, CancellationToken cancellationToken) {
        var connectedSite = await _context.Sites
          .Include(s => s.Contacts)
          .FirstAsync(s => s.Id == request.SiteId, cancellationToken);

        _context.Sites.Remove(connectedSite);

        //! TODO: create requirement that site cannot be deleted when authorized status

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
      }
    }
  }
}
