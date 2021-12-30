using System;
using api.Features;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Infrastructure {
  public partial class AppDbContext : DbContext, IAppDbContext {
    static AppDbContext() {
      NpgsqlConnection.GlobalTypeMapper.MapEnum<AccessLevels>();
      NpgsqlConnection.GlobalTypeMapper.MapEnum<NotificationTypes>();
      NpgsqlConnection.GlobalTypeMapper.MapEnum<ContactTypes>();
      NpgsqlConnection.GlobalTypeMapper.MapEnum<SiteStatus>();
      NpgsqlConnection.GlobalTypeMapper.MapEnum<InventoryStatus>();
    }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public virtual DbSet<Account> Accounts { get; set; } = default!;
    public virtual DbSet<Contact> Contacts { get; set; } = default!;
    public virtual DbSet<Notification> Notifications { get; set; } = default!;
    public virtual DbSet<NotificationReceipt> NotificationReceipts { get; set; } = default!;
    public virtual DbSet<Site> Sites { get; set; } = default!;
    public virtual DbSet<Inventory> Inventories { get; set; } = default!;
    public virtual DbSet<Well> Wells { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
      modelBuilder.HasDefaultSchema("public").HasPostgresEnum("access_level", new[] { "elevated", "standard" })
                .HasPostgresEnum("contact_types", new[] { "owner_operator", "facility_owner", "facility_operator", "facility_manager", "legal_rep", "official_rep", "contractor", "health_dept", "permit_writer", "developer", "other", "project_manager" })
          .HasPostgresEnum("notification_types", new[] { "new_user_account_registration" })
          .HasAnnotation("Relational:Collation", "en_US.utf8");

      modelBuilder.Entity<Account>(entity => {
        entity.ToTable("accounts");

        entity.HasIndex(e => e.UtahId, "account_utah_id_key")
            .IsUnique();

        entity.Property(e => e.Id)
          .HasColumnName("id");

        entity.Property(e => e.City)
            .HasMaxLength(128)
            .HasColumnName("city");

        entity.Property(e => e.Email)
            .HasMaxLength(512)
            .HasColumnName("email");

        entity.Property(e => e.FirstName)
            .HasMaxLength(128)
            .HasColumnName("first_name");

        entity.Property(e => e.LastName)
            .HasMaxLength(128)
            .HasColumnName("last_name");

        entity.Property(e => e.MailingAddress)
            .HasMaxLength(512)
            .HasColumnName("mailing_address");

        entity.Property(e => e.Organization)
            .HasMaxLength(512)
            .HasColumnName("organization");

        entity.Property(e => e.PhoneNumber)
            .HasMaxLength(64)
            .HasColumnName("phone");

        entity.Property(e => e.ReceiveNotifications)
            .HasColumnName("receive_notifications")
            .HasDefaultValueSql("false");

        entity.Property(e => e.State)
            .HasMaxLength(128)
            .HasColumnName("state");

        entity.Property(e => e.UtahId)
            .HasMaxLength(128)
            .HasColumnName("utah_id");

        entity.Property(e => e.ZipCode)
            .HasMaxLength(64)
            .HasColumnName("zip_code");

        entity.Property(e => e.Access)
          .HasColumnName("account_access")
          .HasDefaultValue(AccessLevels.standard);

        entity.Property(e => e.ProfileComplete)
          .HasColumnName("complete_profile")
          .HasComputedColumnSql("\nCASE\n    WHEN ((length((organization)::text) > 0) AND (length((email)::text) > 0) AND (length((phone)::text) > 0) AND (length((mailing_address)::text) > 0) AND (length((city)::text) > 0) AND (length((state)::text) > 0) AND (length((zip_code)::text) > 0)) THEN true\n    ELSE false\nEND", true);
      }).HasPostgresEnum<AccessLevels>("public", "access_level");

      modelBuilder.Entity<Contact>(entity => {
        entity.ToTable("contacts");

        entity.Property(e => e.Id).HasColumnName("id");

        entity.Property(e => e.City)
            .HasMaxLength(128)
            .HasColumnName("city");

        entity.Property(e => e.Email)
            .HasMaxLength(512)
            .HasColumnName("email");

        entity.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(128)
            .HasColumnName("first_name");

        entity.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(128)
            .HasColumnName("last_name");

        entity.Property(e => e.MailingAddress)
            .HasMaxLength(512)
            .HasColumnName("mailing_address");

        entity.Property(e => e.Organization)
            .HasMaxLength(512)
            .HasColumnName("organization");

        entity.Property(e => e.PhoneNumber)
            .HasMaxLength(64)
            .HasColumnName("phone");

        entity.Property(e => e.SiteFk).HasColumnName("site_fk");

        entity.Property(e => e.State)
            .HasMaxLength(128)
            .HasColumnName("state");

        entity.Property(e => e.ZipCode)
            .HasMaxLength(64)
            .HasColumnName("zip_code");

        entity.Property(e => e.ContactType).HasColumnName("contact_type");

        entity.HasOne(d => d.Site)
            .WithMany(p => p.Contacts)
            .HasForeignKey(d => d.SiteFk)
            .OnDelete(DeleteBehavior.ClientCascade)
            .HasConstraintName("contact_to_site_fk");
      }).HasPostgresEnum<ContactTypes>("public", "contact_types");

      modelBuilder.Entity<Notification>(entity => {
        entity.ToTable("notifications");

        entity.Property(e => e.Id).HasColumnName("id");

        entity.Property(e => e.AdditionalData)
            .HasColumnType("jsonb")
            .HasColumnName("additional_data");

        entity.Property(e => e.CreatedAt).HasColumnName("created_at")
        .HasDefaultValueSql("now()");

        entity.Property(e => e.NotificationType).HasColumnName("notification_type");

        entity.Property(e => e.Url)
            .HasMaxLength(512)
            .HasColumnName("url");
      }).HasPostgresEnum<NotificationTypes>("public", "notification_types");

      modelBuilder.Entity<NotificationReceipt>(entity => {
        entity.ToTable("notification_receipts");

        entity.Property(e => e.Id)
            .HasColumnName("id");

        entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");

        entity.Property(e => e.NotificationFk).HasColumnName("notification_fk")
            .ValueGeneratedOnAdd();

        entity.Property(e => e.ReadAt).HasColumnName("read_at");

        entity.Property(e => e.RecipientId).HasColumnName("recipient_id");

        entity.HasOne(d => d.Recipient)
            .WithMany(p => p.NotificationReceipts)
            .HasForeignKey(d => d.RecipientId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("accounts_fk");

        entity.HasOne(d => d.Notification)
            .WithMany(p => p.NotificationReceipts)
            .HasForeignKey(d => d.NotificationFk)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("notification_receipt_fk");
      });

      modelBuilder.Entity<Site>(entity => {
        entity.ToTable("sites");

        entity.Property(e => e.Id)
          .HasColumnName("id");

        entity.Property(e => e.Name)
          .IsRequired()
          .HasMaxLength(128)
          .HasColumnName("name");

        entity.Property(e => e.Ownership)
          .IsRequired()
          .HasMaxLength(2)
          .HasColumnName("ownership");

        entity.Property(e => e.NaicsPrimary)
          .HasColumnName("naics_primary");

        entity.Property(e => e.NaicsTitle)
          .HasColumnName("naics_title")
          .IsRequired()
          .HasMaxLength(128);

        entity.Property(e => e.AccountFk)
          .HasColumnName("account_fk");

        entity.HasOne<Account>(d => d.Account)
            .WithMany(p => p.Sites)
            .HasForeignKey(d => d.AccountFk)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("site_to_account_fk");
      });

      modelBuilder.Entity<Well>(entity => {
        entity.ToTable("wells");

        entity.Property(e => e.Id)
            .HasColumnName("id");

        entity.Property(e => e.AccountFk)
            .HasColumnName("account_fk");

        entity.Property(e => e.SiteFk)
            .HasColumnName("site_fk");

        entity.Property(e => e.InventoryFk)
          .HasColumnName("inventory_fk");

        entity.Property(e => e.Description)
          .HasColumnName("description");

        entity.Property(e => e.Status)
          .HasColumnName("status");

        entity.Property(e => e.RemediationDescription)
          .HasColumnName("remediation_description");

        entity.Property(e => e.RemediationType)
          .HasColumnName("remediation_type");

        entity.Property(e => e.RemediationProjectId)
          .HasColumnName("remediation_project_id");

        entity.Property(e => e.Quantity)
          .HasColumnName("quantity");

        entity.Property(e => e.Geometry)
          .HasColumnName("geometry");

        entity.Property(e => e.CreatedOn)
          .HasDefaultValueSql("CURRENT_TIMESTAMP")
          .HasColumnName("created_on");

        entity.Property(e => e.WellName)
            .HasMaxLength(128)
            .HasColumnName("well_name");

        entity.Property(e => e.SubClass)
            .IsRequired()
            .HasColumnName("sub_class");

        entity.Property(e => e.ConstructionDetails)
            .HasMaxLength(2500)
            .HasColumnName("construction_details");

        entity.Property(e => e.InjectateCharacterization)
            .HasMaxLength(2500)
            .HasColumnName("injectate_characterization");

        entity.Property(e => e.HydrogeologicCharacterization)
            .HasMaxLength(2500)
            .HasColumnName("hydrogeologic_characterization");

        entity.HasOne<Account>(d => d.Account)
            .WithMany(p => p.Wells)
            .HasForeignKey(d => d.AccountFk)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("well_to_account_fk");

        entity.HasOne<Site>(d => d.Site)
            .WithMany(p => p.Wells)
            .HasForeignKey(d => d.SiteFk)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("well_to_site_fk");

        entity.HasOne<Inventory>(d => d.Inventory)
            .WithMany(p => p.Wells)
            .HasForeignKey(d => d.InventoryFk)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("well_to_inventory_fk");
      });

      modelBuilder.Entity<Inventory>(entity => {
        entity.Property(e => e.Id)
        .HasColumnName("id");

        entity.Property(e => e.SiteFk)
          .IsRequired()
          .HasColumnName("site_fk");

        entity.Property(e => e.AccountFk)
          .IsRequired()
          .HasColumnName("account_fk");

        entity.Property(e => e.SubClass)
          .IsRequired()
          .HasColumnName("sub_class");

        entity.Property(e => e.OrderNumber)
          .IsRequired()
          .HasMaxLength(128)
          .HasColumnName("order_number");

        entity.Property(e => e.Signature)
          .HasMaxLength(128)
          .HasColumnName("signature");

        entity.Property<DateTime?>("SubmittedOn")
          .HasColumnName("submitted_on");

        entity.Property<DateTime?>("CreatedOn")
          .HasDefaultValueSql("CURRENT_TIMESTAMP()")
          .HasColumnName("created_on");

        entity.HasKey("Id")
          .HasName("inventory_primary_key");

        entity.HasIndex("AccountFk")
          .HasDatabaseName("ix_inventory_account_fk");

        entity.HasIndex("SiteFk")
          .HasDatabaseName("ix_inventory_site_fk");

        entity.ToTable("inventories");

        entity.HasOne<Account>(d => d.Account)
          .WithMany(p => p.Inventories)
          .HasForeignKey(d => d.AccountFk)
          .HasConstraintName("inventory_to_account_fk")
          .OnDelete(DeleteBehavior.NoAction);

        entity.HasOne<Site>(d => d.Site)
          .WithMany(p => p.Inventories)
          .HasForeignKey(d => d.SiteFk)
          .HasConstraintName("inventory_to_site_fk")
          .IsRequired();
      });

      OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
  }
}
