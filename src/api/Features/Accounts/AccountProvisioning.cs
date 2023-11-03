using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace api.Features;
public static class AccountProvisioning {
    public class Computation : IRequest<bool> {
        public Account Account { get; } = new();

        public Computation(IEnumerable<Claim> claims) {
            foreach (var claim in claims) {
                switch (claim.Type.Split('/').Last()) {
                    case "nameidentifier":
                        Account.UtahId = claim.Value;
                        break;
                    case "givenname":
                        Account.FirstName = claim.Value;
                        break;
                    case "surname":
                        Account.LastName = claim.Value;
                        break;
                    case "emailaddress":
                        Account.Email = claim.Value;
                        break;
                }
            }
        }
    }

    public class Handler(IAppDbContext context) : IRequestHandler<Computation, bool> {
        private readonly IAppDbContext _context = context;

        public async Task<bool> Handle(Computation computation, CancellationToken token) {
            var account = await _context.Accounts.SingleOrDefaultAsync(x => x.UtahId == computation.Account.UtahId, token);

            if (account is not null) {
                return false;
            }

            await _context.Accounts.AddAsync(computation.Account, token);
            await _context.SaveChangesAsync(token);

            return true;
        }
    }
}
