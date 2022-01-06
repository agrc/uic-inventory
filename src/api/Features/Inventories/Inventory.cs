using System;
using System.Collections.Generic;
using System.Linq;
using MediatR.Behaviors.Authorization.Exceptions;

namespace api.Features {
  public class Inventory {
    public int Id { get; set; }
    public int SiteFk { get; set; }
    public int AccountFk { get; set; }
    public int SubClass { get; set; }
    public int OrderNumber { get; set; }
    public string? Signature { get; set; }
    public InventoryStatus Status { get; set; }
    public bool DetailStatus { get; set; }
    public bool ContactStatus { get; set; }
    public bool LocationStatus { get; set; }
    public bool PaymentStatus { get; set; }
    public bool SignatureStatus { get; set; }
    public DateTime? CreatedOn { get; set; }
    public DateTime? SubmittedOn { get; set; }
    public Account? Account { get; set; }
    public Site? Site { get; set; }
    public ICollection<Well> Wells { get; set; } = new HashSet<Well>();
  }

  public class InventoryPayload : ResponseContract {
    public InventoryPayload(Exception error) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public InventoryPayload(UnauthorizedException error) : base(error.Message) { }
    public InventoryPayload(string error) : base($"I01:{error}") { }

    public InventoryPayload(Inventory inventory, Site site) {
      Site = new SitePayload(site);
      Id = inventory.Id;
      SubClass = inventory.SubClass;
      OrderNumber = inventory.OrderNumber;
      Signature = inventory.Signature;
      SubmittedOn = inventory.SubmittedOn;
      Status = inventory.Status;
      DetailStatus = inventory.DetailStatus;
      ContactStatus = inventory.ContactStatus;
      LocationStatus = inventory.LocationStatus;
      PaymentStatus = inventory.PaymentStatus;
      SignatureStatus = inventory.SignatureStatus;
      Wells = inventory.Wells.Select(x => new WellPayload(x)).ToList();
    }
    public int Id { get; set; }
    public int SubClass { get; set; }
    public int OrderNumber { get; set; }
    public string? Signature { get; set; }
    public DateTime? SubmittedOn { get; set; }
    public InventoryStatus Status { get; set; }
    public bool DetailStatus { get; set; }
    public bool ContactStatus { get; set; }
    public bool LocationStatus { get; set; }
    public bool PaymentStatus { get; set; }
    public bool SignatureStatus { get; set; }
    public SitePayload? Site { get; set; }
    public IReadOnlyCollection<WellPayload> Wells { get; set; } = Array.Empty<WellPayload>();
  }

  public class InventoriesForSitePayload : ResponseContract {
    public class Payload {
      public int SiteId { get; set; }
      public int Id { get; set; }
      public int SubClass { get; set; }
      public InventoryStatus Status { get; set; }
      public bool DetailStatus { get; set; }
      public bool ContactStatus { get; set; }
      public bool LocationStatus { get; set; }
      public bool PaymentStatus { get; set; }
      public bool SignatureStatus { get; set; }
      public Payload(Inventory inventory, Site site) {
        SiteId = site.Id;
        Id = inventory.Id;
        SubClass = inventory.SubClass;
        Status = inventory.Status;
        DetailStatus = inventory.DetailStatus;
        ContactStatus = inventory.ContactStatus;
        LocationStatus = inventory.LocationStatus;
        PaymentStatus = inventory.PaymentStatus;
        SignatureStatus = inventory.SignatureStatus;
      }
    }
    public InventoriesForSitePayload(Exception error) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public InventoriesForSitePayload(UnauthorizedException error) : base(error.Message) { }
    public InventoriesForSitePayload(string error) : base($"SI01:{error}") { }
    public InventoriesForSitePayload(IEnumerable<Inventory> inventories, Site site) {
      Inventories = new List<Payload>();

      foreach (var item in inventories) {
        Inventories.Add(new Payload(item, site));
      }
    }

    public IList<Payload> Inventories { get; } = Array.Empty<Payload>();
  }
  public class InventoryInput {
    public int SiteId { get; set; }
    public int AccountId { get; set; }
  }
  public class InventoryCreationInput : InventoryInput {
    public int SubClass { get; set; }
    public int OrderNumber { get; set; }
  }
  public class InventoryDeletionInput : InventoryInput {
    public int InventoryId { get; set; }
  }
  public class InventorySubmissionInput : InventoryInput {
    public int InventoryId { get; set; }
    public string Signature { get; set; } = default!;
  }

  public enum InventoryStatus {
    Incomplete,
    Complete,
    Submitted,
    Authorized,
    Ingested,
  }
}
