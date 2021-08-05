using System;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace api.Features {
  public static class UpdateAccount {
    public class Command : IRequest<Account> {
      public AccountInput Input { get; }

      public Command(AccountInput input) {
        Input = input;
      }
    }

    public class Handler : IRequestHandler<Command, Account> {
      private readonly IAppDbContext _context;
      private readonly IHttpContextAccessor _accessor;
      private readonly ILogger _log;

      public Handler(
        IAppDbContext context,
        IHttpContextAccessor accessor,
        ILogger log) {
        _context = context;
        _accessor = accessor;
        _log = log;
      }
      public async Task<Account> Handle(Command request, CancellationToken token) {
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
}
