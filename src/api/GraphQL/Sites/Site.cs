using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api.Infrastructure;
using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;

namespace api.GraphQL {
  public class Site {
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Ownership { get; set; }
    public int? NaicsPrimary { get; set; }
    public string? NaicsTitle { get; set; }
    public int AccountFk { get; set; }
    public virtual Account? Account { get; set; }
    public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>();
  }

  public class SiteType : ObjectType<Site> {
    protected override void Configure(IObjectTypeDescriptor<Site> descriptor) {
      descriptor
        .Field(f => f.Account)
        .ResolveWith<AccountResolver>(resolver => resolver.GetAccountsAsync(default!, default!, default!, default))
        .UseDbContext<AppDbContext>()
        .Name("owner");

      descriptor
        .Field(f => f.Contacts)
        .ResolveWith<ContactResolver>(r => r.GetContactsAsync(default!, default!, default))
        .UseDbContext<AppDbContext>();
    }

    private class ContactResolver {
      public async Task<IEnumerable<Contact>> GetContactsAsync(
        Site site,
        [ScopedService] AppDbContext context,
        CancellationToken token
      ) => await context.Contacts
          .Where(c => c.SiteFk == site.Id)
          .ToArrayAsync(token);
    }

    private class AccountResolver {
      public async Task<Account> GetAccountsAsync(
        Site site,
        [ScopedService] AppDbContext context,
        AccountByIdDataLoader loader,
        CancellationToken cancellationToken) {
        var ids = await context.Sites
          .Where(a => a.Id == site.Id)
          .Include(a => a.Account)
          .Select(a => a.Account.Id)
          .ToArrayAsync(cancellationToken: cancellationToken);

        var accounts = await loader.LoadAsync(ids, cancellationToken);

        return accounts.FirstOrDefault();
      }
    }
  }

  public class SiteInput {
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Ownership { get; set; }
    public string? Naics { get; set; }
    public string? NaicsTitle { get; set; }
  }

  public static class SiteInputExtension {
    public static Site Update(this SiteInput input, Site site) {
      site.AccountFk = input.Id;

      if (input.Name != null) {
        site.Name = input.Name;
      }

      if (input.Naics != null && int.TryParse(input.Naics, out var naicsCode)) {
        site.NaicsPrimary = naicsCode;
      }

      if (input.NaicsTitle != null) {
        site.NaicsTitle = input.NaicsTitle;
      }

      if (input.Ownership != null) {
        site.Ownership = input.Ownership;
      }

      return site;
    }
  }

  public class SitePayload {
    public SitePayload(Site site) {
      Site = site;
    }

    public Site Site { get; }
  }
}
