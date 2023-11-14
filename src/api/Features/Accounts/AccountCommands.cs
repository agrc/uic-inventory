using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class UpdateAccount {
    public class Command(AccountInput input) : IRequest<Account> {
        public AccountInput Input { get; } = input;
    }

    public class Handler(
      AppDbContext context,
      ILogger log) : IRequestHandler<Command, Account> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;

        public async Task<Account> Handle(Command request, CancellationToken token) {
            _log.ForContext("input", request)
              .Debug("Updating account");

            var account = await _context.Accounts.SingleOrDefaultAsync(a => a.Id == request.Input.Id, token) ?? throw new ArgumentNullException(nameof(request));

            account = request.Input.UpdateAccount(account);

            await _context.SaveChangesAsync(token);

            return account;
        }
    }
}

public static class AdminUpdateAccount {
    public class Command(AdminAccountInput input) : IRequest<Account> {
        public AdminAccountInput Input { get; } = input;
    }

    public class Handler(
      AppDbContext context,
      IPublisher publisher,
      ILogger log) : IRequestHandler<Command, Account> {
        private readonly AppDbContext _context = context;
        private readonly ILogger _log = log;
        private readonly IPublisher _publisher = publisher;

        public async Task<Account> Handle(Command request, CancellationToken token) {
            _log.ForContext("input", request)
              .Debug("Updating account");

            var account = await _context.Accounts.SingleOrDefaultAsync(a => a.Id == request.Input.Id, token) ?? throw new ArgumentNullException(nameof(request));

            var promoted = false;
            if (request.Input.Access == AccessLevels.elevated && account.Access == AccessLevels.standard) {
                promoted = true;
            }

            account = request.Input.UpdateAccount(account);

            await _context.SaveChangesAsync(token);

            if (promoted) {
                await _publisher.Publish(new AccountNotifications.AdminAccountNotification {
                    Account = account,
                    NotificationType = NotificationTypes.admin_promotion
                }, token);
            }

            return account;
        }
    }
}

public static class DeleteAccount {
    public class Command : IRequest<Account> {
        public Command(ClaimsPrincipal user) {
            var utahIdClaim = user.FindFirst(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException("User must have a name identifier.");

            UtahId = utahIdClaim.Value;
        }
        public string UtahId { get; }

        public class Handler(
          AppDbContext context,
          ILogger log) : IRequestHandler<Command, Account> {
            private readonly AppDbContext _context = context;
            private readonly ILogger _log = log;

            public async Task<Account> Handle(Command request, CancellationToken token) {
                using var transaction = await _context.Database.BeginTransactionAsync();
                var account = await _context.Accounts.SingleOrDefaultAsync(x => x.UtahId == request.UtahId, token);

                if (account is null) {
                    throw new ArgumentNullException(nameof(request));
                }

                // get all draft inventories for the account
                var incompleteInventories = _context.Inventories.Include(x => x.Wells)
                  .Where(x => x.Status == InventoryStatus.Incomplete && x.AccountFk == account.Id).ToList();

                _log.ForContext("account", request.UtahId)
                  .Warning("Deleting draft inventories {@ids}", incompleteInventories.Select(x => x.Id));

                // remove all wells from draft inventories
                _log.ForContext("account", request.UtahId)
                  .Warning("Deleting draft inventory wells {@ids}", incompleteInventories.SelectMany(x => x.Wells).Select(x => x.Id));

                incompleteInventories.ForEach(x => _context.Wells.RemoveRange(x.Wells));
                _context.SaveChanges();

                // remove all inventories with no wells
                var inventoriesWithoutWells = incompleteInventories.Where(x => !x.Wells.Any()).ToList();

                _log.ForContext("account", request.UtahId)
                  .Warning("Deleting inventories with no wells {@ids}", inventoriesWithoutWells.Select(x => x.Id));

                _context.Inventories.RemoveRange(inventoriesWithoutWells);
                _context.Inventories.RemoveRange(incompleteInventories);
                _context.SaveChanges();

                // remove all sites with no inventories
                var emptySiteInventories = _context.Sites
                    .Include(x => x.Inventories)
                    .Include(x => x.Contacts)
                    .Where(x => !x.Inventories.Any() && x.AccountFk == account.Id).ToList();

                _log.ForContext("account", request.UtahId)
                    .Warning("Deleting empty sites {@ids}", emptySiteInventories.Select(x => x.Id));

                // delete site contacts
                var emptySiteContacts = emptySiteInventories.SelectMany(x => x.Contacts);

                _log.ForContext("account", request.UtahId)
                    .Warning("Deleting empty site contacts {@ids}", emptySiteContacts.Select(x => x.Id));

                _context.Contacts.RemoveRange(emptySiteContacts);
                _context.SaveChanges();

                _context.Sites.RemoveRange(emptySiteInventories);
                _context.SaveChanges();

                // remove all notifications for account
                _log.ForContext("account", request.UtahId)
                    .Warning("Deleting notifications");

                _context.NotificationReceipts.RemoveRange(_context.NotificationReceipts.Where(x => x.RecipientId == account.Id));
                _context.SaveChanges();

                _log.ForContext("input", request)
                  .ForContext("Person", $"{account.FirstName} {account.LastName}")
                  .Warning("Removing all account information: {utahid}", request.UtahId);

                account.Delete();
                _context.SaveChanges();

                // TODO! send a notification to remove site and inventory cloud storage
                await transaction.CommitAsync(token);

                return account;
            }
        }
    }
}
