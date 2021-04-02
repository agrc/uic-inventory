using System.Linq;
using api.Entities;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Data;

namespace api.Features.Queries {
  public class AccountQuery {
    [UseDbContext(typeof(AppDbContext))]
    [UseProjection]
    public IQueryable<Account> GetAccount([ScopedService] AppDbContext context) => context.Accounts;
  }
}
