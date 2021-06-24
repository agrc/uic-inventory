using System;
using System.Threading;
using System.Threading.Tasks;
using api.Exceptions;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;

namespace api.GraphQL {
  [ExtendObjectType("Mutation")]
  public class SiteMutations {
    [UseApplicationDbContext]
    public async Task<SitePayload> CreateSiteAsync([ScopedService] AppDbContext context, SiteInput input, CancellationToken token) {
      var site = await context.Sites.AddAsync(input.Update(new()), token);

      try {
        await context.SaveChangesAsync(token);
      } catch (Exception ex) {
        throw new AccountNotFoundException(input.Id.ToString(), ex);
      }

      return new SitePayload(site.Entity);
    }

    [UseApplicationDbContext]
    public async Task<SitePayload> AddLocationAsync([ScopedService] AppDbContext context, SiteLocationInput input, CancellationToken token) {
      var item = await context.Sites.FirstOrDefaultAsync(x => x.Id == input.Id, token);

      if (item is null) {
        return new SitePayload(new[] {
          new UserError("Site not found", "MISSING_SITE")
        });
      }

      item.Address = input.Address;
      item.Geometry = input.Geometry;

      try {
        await context.SaveChangesAsync(token);
      } catch (Exception ex) {
        throw new AccountNotFoundException(input.Id.ToString(), ex);
      }

      return new SitePayload(item);
    }
  }
}
