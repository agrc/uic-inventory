using System;
using System.Collections.Generic;
using System.Linq;

namespace api.Features {
  public class Inventory {
    public int Id { get; set; }
    public int SiteFk { get; set; }
    public int AccountFk { get; set; }
    public int SubClass { get; set; }
    public int OrderNumber { get; set; }
    public string? Signature { get; set; }
    public DateTime? CreatedOn { get; set; }
    public DateTime? SubmittedOn { get; set; }
    public Account? Account { get; set; }
    public Site? Site { get; set; }
    public ICollection<Well> Wells { get; set; } = new HashSet<Well>();
  }

  public class InventoryPayload : ResponseContract {
    public InventoryPayload(UnauthorizedAccessException error) : base(error.Message) { }
    public InventoryPayload(Exception error) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public InventoryPayload(Inventory inventory, Site site) {
      Site = new SitePayload(site);
      Id = inventory.Id;
      SubClass = inventory.SubClass;
      OrderNumber = inventory.OrderNumber;
      SubmittedOn = inventory.SubmittedOn;
      Wells = inventory.Wells.Select(x => new WellPayload(x)).ToList();
    }
    public int Id { get; set; }
    public int SubClass { get; set; }
    public int OrderNumber { get; set; }
    public string? Signature { get; set; }
    public DateTime? SubmittedOn { get; set; }
    public SitePayload? Site { get; set; }
    public IReadOnlyCollection<WellPayload> Wells { get; set; } = Array.Empty<WellPayload>();
  }

  public class InventoryInput {
    public int SiteId { get; set; }
    public int AccountId { get; set; }
    public int SubClass { get; set; }
    public int OrderNumber { get; set; }
  }
}
