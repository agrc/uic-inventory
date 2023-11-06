using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class CreateContact {
    public class Command(int siteId, ContactInput input) : IRequest<Contact> {
        public int SiteId { get; } = siteId;
        public ContactInput Input { get; } = input;

        public class Handler(AppDbContext context, IPublisher publisher, ILogger log) : IRequestHandler<Command, Contact> {
            private readonly ILogger _log = log;
            private readonly AppDbContext _context = context;
            private readonly IPublisher _publisher = publisher;

            public async Task<Contact> Handle(Command request, CancellationToken cancellationToken) {
                _log.ForContext("input", request)
                  .Debug("Creating contact");

                var contact = await _context.Contacts.AddAsync(request.Input.Update(new()), cancellationToken);

                await _context.SaveChangesAsync(cancellationToken);

                await _publisher.Publish(new SiteNotifications.EditNotification(request.SiteId), cancellationToken);
                await _publisher.Publish(new ContactNotifications.AddContactNotification(request.Input.SiteId, request.Input.AccountId), cancellationToken);

                return contact.Entity;
            }
        }
    }
}

public static class DeleteContact {
    public class Command(ContactInput input) : IRequest {
        public int AccountId { get; } = input.AccountId;
        public int ContactId { get; set; } = input.ContactId;
        public int SiteId { get; set; } = input.SiteId;

        public class Handler(AppDbContext context, IPublisher publisher, ILogger log) : IRequestHandler<Command> {
            private readonly ILogger _log = log;
            private readonly AppDbContext _context = context;
            private readonly IPublisher _publisher = publisher;

            async Task IRequestHandler<Command>.Handle(Command request, CancellationToken cancellationToken) {
                _log.ForContext("input", request)
                  .Debug("Deleting contact");

                var contact = await _context.Contacts
                 .FirstAsync(s => s.Id == request.ContactId, cancellationToken);

                _context.Contacts.Remove(contact);

                //! TODO: create requirement that site cannot be deleted when authorized status

                await _context.SaveChangesAsync(cancellationToken);

                await _publisher.Publish(new SiteNotifications.EditNotification(request.SiteId), cancellationToken);
                await _publisher.Publish(new ContactNotifications.DeleteContactNotification(request.AccountId, request.SiteId), cancellationToken);

                return;
            }
        }
    }
}
