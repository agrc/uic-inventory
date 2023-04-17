using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class CreateContact {
    public class Command : IRequest<Contact> {
      public Command(int siteId, ContactInput input) {
        SiteId = siteId;
        Input = input;
      }

      public int SiteId { get; }
      public ContactInput Input { get; }

      public class Handler : IRequestHandler<Command, Contact> {
        private readonly ILogger _log;
        private readonly AppDbContext _context;
        private readonly IPublisher _publisher;

        public Handler(AppDbContext context, IPublisher publisher, ILogger log) {
          _context = context;
          _publisher = publisher;
          _log = log;
        }

        public async Task<Contact> Handle(Command request, CancellationToken cancellationToken) {
          _log.ForContext("input", request)
            .Debug("Creating contact");

          var contact = await _context.Contacts.AddAsync(request.Input.Update(new()), cancellationToken);

          await _context.SaveChangesAsync(cancellationToken);

          await _publisher.Publish(new SiteNotifications.EditNotification(request.SiteId), cancellationToken);

          return contact.Entity;
        }
      }
    }
  }

  public static class DeleteContact {
    public class Command : IRequest {
      public Command(ContactInput input) {
        Input = input;
      }

      public ContactInput Input { get; }

      public class Handler : IRequestHandler<Command> {
        private readonly ILogger _log;
        private readonly AppDbContext _context;
        private readonly IPublisher _publisher;

        public Handler(AppDbContext context, IPublisher publisher, ILogger log) {
          _context = context;
          _publisher = publisher;
          _log = log;
        }

        async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
          _log.ForContext("input", request)
            .Debug("Deleting contact");

          var contact = await _context.Contacts
           .FirstAsync(s => s.Id == request.Input.ContactId, cancellationToken);

          _context.Contacts.Remove(contact);

          //! TODO: create requirement that site cannot be deleted when authorized status

          await _context.SaveChangesAsync(cancellationToken);

          await _publisher.Publish(new SiteNotifications.EditNotification(request.Input.SiteId), cancellationToken);

          return;
        }
      }
    }
  }
}
