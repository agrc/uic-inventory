using System;
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
      IAppDbContext context,
      ILogger log) : IRequestHandler<Command, Account> {
        private readonly IAppDbContext _context = context;
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
      IAppDbContext context,
      IPublisher publisher,
      ILogger log) : IRequestHandler<Command, Account> {
        private readonly IAppDbContext _context = context;
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
