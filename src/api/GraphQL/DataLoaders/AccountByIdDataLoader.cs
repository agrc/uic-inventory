using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using GreenDonut;
using HotChocolate.DataLoader;
using Microsoft.EntityFrameworkCore;

namespace api.GraphQL {
public class AccountByIdDataLoader : BatchDataLoader<int, Account> {
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;

    public AccountByIdDataLoader(
        IBatchScheduler batchScheduler,
        IDbContextFactory<AppDbContext> dbContextFactory)
        : base(batchScheduler) {
      _dbContextFactory = dbContextFactory ?? throw new ArgumentNullException(nameof(dbContextFactory));
    }

    protected override async Task<IReadOnlyDictionary<int, Account>> LoadBatchAsync(
        IReadOnlyList<int> keys,
        CancellationToken cancellationToken) {
      await using var dbContext =
          _dbContextFactory.CreateDbContext();

      return await dbContext.Accounts
          .Where(s => keys.Contains(s.Id))
          .ToDictionaryAsync(t => t.Id, cancellationToken);
    }
  }
}
