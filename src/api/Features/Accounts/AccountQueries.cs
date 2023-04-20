using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace api.Features;
public static class GetMyAccount {
    public class Query : IRequest<Account> {
        public Query(ClaimsPrincipal user) {
            var utahIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (utahIdClaim is null) {
                throw new UnauthorizedAccessException("User must have a name identifier.");
            }

            UtahId = utahIdClaim.Value;
        }
        public string UtahId { get; }
        public class Handler : IRequestHandler<Query, Account> {
            private readonly IAppDbContext _context;

            public Handler(IAppDbContext context) {
                _context = context;
            }

            public async Task<Account> Handle(Query request, CancellationToken cancellationToken) =>
              await _context.Accounts.SingleOrDefaultAsync(x => x.UtahId == request.UtahId, cancellationToken);
        }
    }
}

public static class GetAccountById {
    public class Query : IRequest<Account> {
        public Query(int id) {
            AccountId = id;
        }
        public int AccountId { get; }
        public class Handler : IRequestHandler<Query, Account> {
            private readonly IAppDbContext _context;

            public Handler(IAppDbContext context) {
                _context = context;
            }

            public async Task<Account> Handle(Query request, CancellationToken cancellationToken) =>
              await _context.Accounts.SingleOrDefaultAsync(x => x.Id == request.AccountId, cancellationToken);
        }
    }
}

public static class GetAllAccounts {
    public class Query : IRequest<IReadOnlyList<Account>> {
        public class Handler : IRequestHandler<Query, IReadOnlyList<Account>> {
            private readonly IAppDbContext _context;

            public Handler(IAppDbContext context) {
                _context = context;
            }

            public async Task<IReadOnlyList<Account>> Handle(Query request, CancellationToken cancellationToken) =>
              await _context.Accounts.OrderBy(x => x.FirstName).ToListAsync(cancellationToken);
        }
    }
}
