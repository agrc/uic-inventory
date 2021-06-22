using System;
using System.Threading.Tasks;
using api.Exceptions;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Types;

namespace api.GraphQL {
  [ExtendObjectType("Mutation")]
  public class SiteMutations {
    [UseApplicationDbContext]
    public async Task<SitePayload> CreateSiteAsync([ScopedService] AppDbContext context, SiteInput input) {
      var site = await context.Sites.AddAsync(input.Update(new()));

      try {
        await context.SaveChangesAsync();
      } catch (Exception ex) {
        throw new AccountNotFoundException(input.Id.ToString(), ex);
      }

      return new SitePayload(site.Entity);
    }
  }
}
