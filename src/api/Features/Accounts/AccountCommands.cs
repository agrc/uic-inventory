using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features;
public static class UpdateAccount {
    public class Command : IRequest<Account> {
        public AccountInput Input { get; }

        public Command(AccountInput input) {
            Input = input;
        }
    }

    public class Handler : IRequestHandler<Command, Account> {
        private readonly IAppDbContext _context;
        private readonly ILogger _log;

        public Handler(
          IAppDbContext context,
          ILogger log) {
            _context = context;
            _log = log;
        }
        public async Task<Account> Handle(Command request, CancellationToken token) {
            _log.ForContext("input", request)
              .Debug("Updating account");

            var account = await _context.Accounts.SingleOrDefaultAsync(a => a.Id == request.Input.Id, token);

            if (account == null) {
                throw new ArgumentNullException(nameof(request));
            }

            account = request.Input.UpdateAccount(account);

            await _context.SaveChangesAsync(token);

            return account;
        }
    }
}

public static class AdminUpdateAccount {
    public class Command : IRequest<Account> {
        public AdminAccountInput Input { get; }

        public Command(AdminAccountInput input) {
            Input = input;
        }
    }

    public class Handler : IRequestHandler<Command, Account> {
        private readonly IAppDbContext _context;
        private readonly ILogger _log;
        private readonly IPublisher _publisher;

        public Handler(
          IAppDbContext context,
          IPublisher publisher,
          ILogger log) {
            _context = context;
            _publisher = publisher;
            _log = log;
        }
        public async Task<Account> Handle(Command request, CancellationToken token) {
            _log.ForContext("input", request)
              .Debug("Updating account");

            var account = await _context.Accounts.SingleOrDefaultAsync(a => a.Id == request.Input.Id, token);

            if (account == null) {
                throw new ArgumentNullException(nameof(request));
            }

            var promoted = false;
            if (request.Input.Access == AccessLevels.elevated && account.Access == AccessLevels.standard) {
                promoted = true;
            }

            account = request.Input.UpdateAccount(account);

            await _context.SaveChangesAsync(token);

            if (promoted) {
                await _publisher.Publish(new AccountNotifications.AdminAccountNotification {
                    Account = account,
                    Type = NotificationTypes.admin_promotion
                }, token);
            }

            return account;
        }
    }
}
