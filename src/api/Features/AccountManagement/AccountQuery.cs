using System.Linq;
using api.Entities;
using api.Features.UserRegistration;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Data;

namespace api.Features.Queries {
  [Authorize]
  public class AccountQuery {
    [UseDbContext(typeof(AppDbContext))]
    [UseProjection]
    public IQueryable<Account> GetAccounts([ScopedService] AppDbContext context) => context.Accounts;
  }
}
