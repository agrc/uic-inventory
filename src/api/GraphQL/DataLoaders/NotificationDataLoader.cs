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
  public class NotificationByIdDataLoader : BatchDataLoader<int, NotificationPayload> {
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;

    public NotificationByIdDataLoader(IBatchScheduler batchScheduler, IDbContextFactory<AppDbContext> dbContextFactory)
        : base(batchScheduler) {
      _dbContextFactory = dbContextFactory ?? throw new ArgumentNullException(nameof(dbContextFactory));
    }

    protected override async Task<IReadOnlyDictionary<int, NotificationPayload>> LoadBatchAsync(
        IReadOnlyList<int> keys, CancellationToken cancellationToken) {
      await using var dbContext = _dbContextFactory.CreateDbContext();

      return await dbContext.NotificationReceipts
          .Include(x => x.Notification)
          .Where(s => keys.Contains(s.Id))
          .Select(x => new NotificationPayload(x.Notification, x))
          .ToDictionaryAsync(t => t.Id, cancellationToken);
    }
  }
}
