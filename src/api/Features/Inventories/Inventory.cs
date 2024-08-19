using System;
using System.Collections.Generic;
using System.Linq;
using MediatR.Behaviors.Authorization.Exceptions;
using Microsoft.AspNetCore.Http;

namespace api.Features;
public class Inventory {
    public int Id { get; set; }
    public int SiteFk { get; set; }
    public int AccountFk { get; set; }
    public int SubClass { get; set; }
    public string? OrderNumber { get; set; }
    public string? Signature { get; set; }
    public InventoryStatus Status { get; set; }
    public bool DetailStatus { get; set; }
    public bool ContactStatus { get; set; }
    public bool LocationStatus { get; set; }
    public bool PaymentStatus { get; set; }
    public bool SignatureStatus { get; set; }
    public string? Edocs { get; set; }
    public string? Flagged { get; set; }
    public DateTime? CreatedOn { get; set; }
    public DateTime? SubmittedOn { get; set; }
    public DateTime? UnderReviewOn { get; set; }
    public Account? UnderReviewByAccount { get; set; }
    public DateTime? ApprovedOn { get; set; }
    public Account? ApprovedByAccount { get; set; }
    public DateTime? AuthorizedOn { get; set; }
    public Account? AuthorizedByAccount { get; set; }
    public DateTime? CompletedOn { get; set; }
    public Account? CompletedByAccount { get; set; }
    public Account? Account { get; set; }
    public Site? Site { get; set; }
    public ICollection<Well> Wells { get; set; } = new HashSet<Well>();
}

public class InventoryPayload : ResponseContract {
    public InventoryPayload(UnauthorizedException error) : base(error.Message) { }
    public InventoryPayload(Exception _) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public InventoryPayload(string error) : base($"I01:{error}") { }

    public InventoryPayload(Inventory inventory, Site site) {
        Site = new SitePayload(site);
        Id = inventory.Id;
        SubClass = inventory.SubClass;
        OrderNumber = inventory.OrderNumber;
        Signature = inventory.Signature;

        Status = inventory.Status;
        DetailStatus = inventory.DetailStatus;
        ContactStatus = inventory.ContactStatus;
        LocationStatus = inventory.LocationStatus;
        PaymentStatus = inventory.PaymentStatus;
        SignatureStatus = inventory.SignatureStatus;

        Edocs = inventory.Edocs;
        Flagged = inventory.Flagged;
        Wells = inventory.Wells.Select(x => new WellPayload(x)).ToList();

        SubmittedOn = inventory.SubmittedOn;
        UnderReviewOn = inventory.UnderReviewOn;
        SubmittedOn = inventory.SubmittedOn;
        ApprovedOn = inventory.ApprovedOn;
        AuthorizedOn = inventory.AuthorizedOn;
        CompletedOn = inventory.CompletedOn;

        UnderReviewBy = new(inventory.UnderReviewByAccount);
        ApprovedBy = new(inventory.ApprovedByAccount);
        AuthorizedBy = new(inventory.AuthorizedByAccount);
        CompletedBy = new(inventory.CompletedByAccount);
    }
    public int Id { get; set; }
    public int SubClass { get; set; }
    public string? OrderNumber { get; set; }
    public string? Signature { get; set; }
    public DateTime? SubmittedOn { get; set; }
    public DateTime? UnderReviewOn { get; set; }
    public DateTime? ApprovedOn { get; set; }
    public DateTime? AuthorizedOn { get; set; }
    public DateTime? CompletedOn { get; set; }
    public InventoryStatus Status { get; set; }
    public bool DetailStatus { get; set; }
    public bool ContactStatus { get; set; }
    public bool LocationStatus { get; set; }
    public bool PaymentStatus { get; set; }
    public bool SignatureStatus { get; set; }
    public string? Edocs { get; set; }
    public string? Flagged { get; set; }
    public SitePayload? Site { get; set; }
    public AccountPayload? UnderReviewBy { get; set; }
    public AccountPayload? ApprovedBy { get; set; }
    public AccountPayload? AuthorizedBy { get; set; }
    public AccountPayload? CompletedBy { get; set; }
    public IReadOnlyCollection<WellPayload> Wells { get; set; } = [];
}

public class InventoriesForSitePayload : ResponseContract {
    public class Payload(Inventory inventory, Site site) {
        public int SiteId { get; set; } = site.Id;
        public int Id { get; set; } = inventory.Id;
        public int SubClass { get; set; } = inventory.SubClass;
        public string? OrderNumber { get; set; } = inventory.OrderNumber;
        public InventoryStatus Status { get; set; } = inventory.Status;
        public bool DetailStatus { get; set; } = inventory.DetailStatus;
        public bool ContactStatus { get; set; } = inventory.ContactStatus;
        public bool LocationStatus { get; set; } = inventory.LocationStatus;
        public bool SignatureStatus { get; set; } = inventory.SignatureStatus;
        public bool Flagged { get; set; } = !string.IsNullOrEmpty(inventory.Flagged);
        public string? EdocsNumber { get; set; } = inventory.Edocs;
    }
    public InventoriesForSitePayload(UnauthorizedException error) : base(error.Message) { }
    public InventoriesForSitePayload(Exception _) : base("WTF01:Something went terribly wrong that we did not expect.") { }
    public InventoriesForSitePayload(string error) : base($"SI01:{error}") { }
    public InventoriesForSitePayload(IEnumerable<Inventory> inventories, Site site) {
        Inventories = [];

        foreach (var item in inventories) {
            Inventories.Add(new Payload(item, site));
        }
    }

    public IList<Payload> Inventories { get; } = [];
}
public class InventoryInput {
    public int SiteId { get; set; }
    public int AccountId { get; set; }
}
public class InventoryCreationInput : InventoryInput {
    private string? _orderNumber;
    public int SubClass { get; set; }
    public string? OrderNumber { get => _orderNumber; set => _orderNumber = value?[..8]; }
}
public class ExistingInventoryInput : InventoryInput {
    public int InventoryId { get; set; }
}
public class InventoryMutationInput : InventoryInput {
    private string? _orderNumber;
    public int InventoryId { get; set; }
    public int? SubClass { get; set; }
    public string? OrderNumber { get => _orderNumber; set => _orderNumber = value?[..8]; }
    public string? Edocs { get; set; }
    public string? Flagged { get; set; }
    public string? SiteIdentifier { get; set; }
}
public class InventorySubmissionInput : InventoryInput {
    public int InventoryId { get; set; }
    public IFormFile? Signature { get; set; }
}

public enum InventoryStatus {
    Incomplete,
    Complete,
    Submitted,
    UnderReview,
    Approved,
    Authorized,
    Completed,
}

public static class InventoryExtensions {
    private static readonly InventoryStatus[] _approvedStatus = [InventoryStatus.Approved, InventoryStatus.Authorized, InventoryStatus.Completed];
    public static bool IsApproved(this InventoryStatus status) => _approvedStatus.Contains(status);
    public static bool IsSerInventory(this Inventory inventory) => inventory.SubClass == 5002;
}
