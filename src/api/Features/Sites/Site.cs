using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Features {
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
    public bool DetailStatus { get; set; }
    public bool ContactStatus { get; set; }
    public bool LocationStatus { get; set; }
    public Account? Account { get; set; }
    public ICollection<Well> Wells { get; set; } = new HashSet<Well>();
    public ICollection<Contact> Contacts { get; set; } = new HashSet<Contact>();
  }
  public class SiteListPayload : ResponseContract {
    public SiteListPayload(Site site) {
      Id = site.Id;
      Name = site.Name ?? string.Empty;
      NaicsTitle = site.NaicsTitle ?? string.Empty;
      Status = site.Status;
      DetailStatus = site.DetailStatus;
      ContactStatus = site.ContactStatus;
      LocationStatus = site.LocationStatus;
    }
    public int Id { get; set; }
    public string Name { get; set; }
    public string NaicsTitle { get; set; }
    public SiteStatus Status { get; set; }
    public bool DetailStatus { get; set; }
    public bool ContactStatus { get; set; }
    public bool LocationStatus { get; set; }
  }
  public class SitePayload : ResponseContract {
    public SitePayload(UnauthorizedAccessException error) : base(error.Message) { }
    public SitePayload(Exception error) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public SitePayload(Site site) {
      Id = site.Id;
      Name = site.Name ?? string.Empty;
      NaicsTitle = site.NaicsTitle ?? string.Empty;
      Ownership = site.Ownership;
      NaicsPrimary = site.NaicsPrimary;
      Address = site.Address;
      Geometry = site.Geometry;
      Status = site.Status;
    }

    public int? Id { get; }
    public string? Name { get; }
    public string? Ownership { get; }
    public string? NaicsTitle { get; }
    public int? NaicsPrimary { get; }
    public string? Address { get; }
    public string? Geometry { get; }
    public SiteStatus Status { get; }
  }
  public class SiteInput {
    public int AccountId { get; set; }
    public int SiteId { get; set; }
    public string? Name { get; set; }
    public string? Ownership { get; set; }
    public string? NaicsPrimary { get; set; }
    public string? NaicsTitle { get; set; }
    public string? Address { get; set; }
    public string? Geometry { get; set; }
  }
  public static class SiteInputExtension {
    public static Site Update(this SiteInput input, Site site) {
      if (input.Name != null) {
        site.Name = input.Name;
      }

      if (input.NaicsPrimary != null && int.TryParse(input.NaicsPrimary, out var naicsCode)) {
        site.NaicsPrimary = naicsCode;
      }

      if (input.NaicsTitle != null) {
        site.NaicsTitle = input.NaicsTitle;
      }

      if (input.Ownership != null) {
        site.Ownership = input.Ownership;
      }

      if (!string.IsNullOrEmpty(input.Address)) {
        site.Address = input.Address;
      }

      if (!string.IsNullOrEmpty(input.Geometry)) {
        site.Geometry = input.Geometry;
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
