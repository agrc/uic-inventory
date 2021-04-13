using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Data;
using HotChocolate.Types;
using System.Threading;

namespace api.GraphQL {
  [Authorize]
  [ExtendObjectType("Query")]
  public class AccountQueries {
    [UseDbContext(typeof(AppDbContext))]
    public IQueryable<Account> GetAccounts([ScopedService] AppDbContext context)
      => context.Accounts.OrderBy(x => x.LastName);

    // [UseProjection]
    [UseDbContext(typeof(AppDbContext))]
    public Task<Account> GetAccountById(
      int id,
      AccountByIdDataLoader loader,
      CancellationToken cancellationToken)
        => loader.LoadAsync(id, cancellationToken);

    [UseDbContext(typeof(AppDbContext))]
    public Task<IReadOnlyList<Account>> GetAccountsById(
      int[] ids,
      AccountByIdDataLoader loader,
      CancellationToken cancellationToken)
        => loader.LoadAsync(ids, cancellationToken);
  }
}
