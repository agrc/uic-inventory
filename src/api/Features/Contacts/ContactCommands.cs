using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
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

        public Handler(AppDbContext context, ILogger log) {
          _context = context;
          _log = log;
        }

        public async Task<Contact> Handle(Command request, CancellationToken cancellationToken) {
          var contact = await _context.Contacts.AddAsync(request.Input.Update(new()), cancellationToken);

          // var site = await _context.Sites .Include(x => x.Contacts)
          //   .FirstAsync(x => x.Id == request.Input.Id, cancellationToken);

          // site.ContactStatus = site.Contacts.Any(x => new[] {
          //   ContactTypes.facility_owner,
          //   ContactTypes.owner_operator,
          //   ContactTypes.legal_rep
          // }.Contains(x.ContactType));

          await _context.SaveChangesAsync(cancellationToken);

          return contact.Entity;
        }
      }
    }
  }
}
