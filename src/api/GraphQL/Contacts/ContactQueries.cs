using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;

namespace api.GraphQL {
  [ExtendObjectType("Query")]
  public class ContactQueries {
    [UseDbContext(typeof(AppDbContext))]
    public IQueryable<Site> GetSites([ScopedService] AppDbContext context)
      => context.Sites;

    // [UseDbContext(typeof(AppDbContext))]
    // public Task<Site> GetSiteById(int id, SiteByIdDataLoader loader, CancellationToken token) =>
    //   loader.LoadAsync(id, token);
  }
}
