using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace api.Features {
  public class Well {
    public int Id { get; set; }
    public int SiteFk { get; set; }
    public int AccountFk { get; set; }
    public int InventoryFk { get; set; }
    public int SubClass { get; set; }
    public string? WellName { get; set; }
    public string? Status { get; set; }
    public string? Description { get; set; }
    public int? Quantity { get; set; }
    [Column(TypeName = "jsonb")] public string? Geometry { get; set; }
    public string? RemediationDescription { get; set; }
    public int? RemediationType { get; set; }
    public string? RemediationProjectId { get; set; }
    public DateTime? CreatedOn { get; set; }
    public Account? Account { get; set; }
    public Site? Site { get; set; }
    public Inventory? Inventory { get; set; }
  }
  public class WellCreationPayload : WellPayload {
    public WellCreationPayload(UnauthorizedAccessException error) : base(error) {
    }

    public WellCreationPayload(Exception error) : base(error) {
    }

    public WellCreationPayload(Well well, Site site) : base(well) {
      Site = new SitePayload(site);
    }

    public SitePayload Site { get; }
  }
  public class WellPayload : ResponseContract {
    private string status;

    public WellPayload(UnauthorizedAccessException error) : base(error.Message) { }
    public WellPayload(Exception error) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public WellPayload(Well well) {
      Id = well.Id;
      WellName = well.WellName;
      SubClass = well.SubClass;
      Status = WellLookup.OperatingStatus(well.Status);
      Count = well.Quantity ?? 0;
      Geometry = well.Geometry ?? "{}";
    }

    public int Id { get; }
    public string? WellName { get; }
    public int SubClass { get; }
    public int Count { get; }
    public string Geometry { get; }
    public string Status { get; }
  }
  public class WellInput {
    public int WellId { get; set; }
    public int SiteId { get; set; }
    public int AccountId { get; set; }
    public int InventoryId { get; set; }
    public int SubClass { get; set; }
    public string? Status { get; set; }
    public int Quantity { get; set; }
    public string? Construction { get; set; }
    public string? Description { get; set; }
    public string? Geometry { get; set; }
    public string? RemediationDescription { get; set; }
    public int? RemediationType { get; set; }
    public string? RemediationProjectId { get; set; }
  }

  public static class WellLookup {
    public static string OperatingStatus(string? key, string missingValue = "") {
      if (string.IsNullOrEmpty(key)) {
        return missingValue;
      }

      key = key.ToUpper();

      var lookup = new Dictionary<string, string> {
        {"AC", "Active"},
        {"PA", "Abandoned ‐ Approved"},
        {"TA", "Abandoned ‐ Temporary"},
        {"AN", "Abandoned ‐ Not Approved"},
        {"PW", "Proposed Under Permit Application"},
        {"PR", "Proposed Under Authorization By Rule"},
        {"PI", "Post Injection CO2 Well"},
        {"OT", "Other"},
      };

      return lookup.GetValueOrDefault(key, missingValue);
    }
  }
}
