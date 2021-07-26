using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.GraphQL {
  public class Site {
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Ownership { get; set; }
    public int? NaicsPrimary { get; set; }
    public string? NaicsTitle { get; set; }
    public int AccountFk { get; set; }
    public string? Address { get; set; }
    [Column(TypeName = "jsonb")] public string? Geometry { get; set; }
    public SiteStatus Status { get; set; }
    public virtual Account? Account { get; set; }
    public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>();
  }

  public class SiteInput {
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Ownership { get; set; }
    public string? Naics { get; set; }
    public string? NaicsTitle { get; set; }
  }

  public class SiteLocationInput {
    public int Id { get; set; }
    public int SiteId { get; set; }
    public string? Address { get; set; }
    public string? Geometry { get; set; }
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

  public enum SiteStatus {
    Incomplete,
    Complete,
    Submitted,
    Authorized,
    Ingested,
  }
}
