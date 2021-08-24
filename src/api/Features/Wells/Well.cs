using System;

namespace api.Features {
  public class Well {
    public int Id { get; set; }
    public int SiteFk { get; set; }
    public int AccountFk { get; set; }
    public string? WellName { get; set; }
    public int SubClass { get; set; }
    public int OrderNumber { get; set; }
    public string? Construction { get; set; }
    public string? Injectate { get; set; }
    public string? Hydrogeologic { get; set; }
    public string? Signature { get; set; }
    public DateTime? SubmittedOn { get; set; }
    public Account? Account { get; set; }
    public Site? Site { get; set; }
  }
  public class WellCreationPayload : WellPayload {
    public WellCreationPayload(UnauthorizedAccessException error) : base(error) {
    }

    public WellCreationPayload(Exception error) : base(error) {
    }

    public WellCreationPayload(Well well, Site site) : base(well) {
      SiteStatus = site.Status;
      SiteName = site.Name;
      SiteType = site.NaicsTitle;
    }

    public SiteStatus SiteStatus { get; }
    public string? SiteName { get; }
    public string? SiteType { get; }
  }
  public class WellPayload : ResponseContract {
    public WellPayload(UnauthorizedAccessException error) : base(error.Message) { }
    public WellPayload(Exception error) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public WellPayload(Well well) {
      Id = well.Id;
      WellName = well.WellName;
      SubClass = well.SubClass;
      OrderNumber = well.OrderNumber;
    }

    public int Id { get; }
    public string? WellName { get; }
    public int SubClass { get; }
    public int OrderNumber { get; }
  }
  public record WellInput(int SiteId, int AccountId, int SubClass, int OrderNumber);
}
