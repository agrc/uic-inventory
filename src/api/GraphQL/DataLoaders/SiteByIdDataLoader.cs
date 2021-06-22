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

  public class SiteByIdDataLoader : BatchDataLoader<(int UserId, int SiteId), Site> {
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;
    public SiteByIdDataLoader(
        IBatchScheduler batchScheduler,
        IDbContextFactory<AppDbContext> dbContextFactory)
        : base(batchScheduler) {
      _dbContextFactory = dbContextFactory ?? throw new ArgumentNullException(nameof(dbContextFactory));
    }
    protected override async Task<IReadOnlyDictionary<(int UserId, int SiteId), Site>> LoadBatchAsync(
        IReadOnlyList<(int UserId, int SiteId)> keys,
        CancellationToken cancellationToken) {
      await using var dbContext = _dbContextFactory.CreateDbContext();

      var stringKeys = keys.Select((e) => e.UserId + "_" + e.SiteId).ToList();

      return await dbContext.Sites
          .Where(s => stringKeys.Contains(s.AccountFk + "_" + s.Id))
          .ToDictionaryAsync(t => (t.AccountFk, t.Id), cancellationToken);
    }
  }

  // public class SiteByIdDataLoader : BatchDataLoader<int, Site> {
  //   private readonly IDbContextFactory<AppDbContext> _dbContextFactory;

  //   public SiteByIdDataLoader(
  //       IBatchScheduler batchScheduler,
  //       IDbContextFactory<AppDbContext> dbContextFactory)
  //       : base(batchScheduler) {
  //     _dbContextFactory = dbContextFactory ?? throw new ArgumentNullException(nameof(dbContextFactory));
  //   }

  //   protected override async Task<IReadOnlyDictionary<int, Site>> LoadBatchAsync(
  //       IReadOnlyList<int> keys,
  //       CancellationToken cancellationToken) {
  //     await using var dbContext =
  //         _dbContextFactory.CreateDbContext();

  //     return await dbContext.Sites
  //         .Where(s => keys.Contains(s.Id))
  //         .ToDictionaryAsync(t => t.Id, cancellationToken);
  //   }
  // }
}
