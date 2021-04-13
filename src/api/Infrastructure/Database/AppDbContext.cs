using api.GraphQL;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Infrastructure {
  public partial class AppDbContext : DbContext {
    static AppDbContext() {
      NpgsqlConnection.GlobalTypeMapper.MapEnum<Access>();
      NpgsqlConnection.GlobalTypeMapper.MapEnum<NotificationTypes>();
    }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public virtual DbSet<Account> Accounts { get; set; } = default!;
    public virtual DbSet<Notification> Notifications { get; set; } = default!;
    public virtual DbSet<NotificationReceipt> NotificationReceipts { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
      modelBuilder.HasPostgresEnum(null, "access_level", new[] { "elevated", "standard" })
          .HasPostgresEnum(null, "notification_types", new[] { "new_user_account_registration" })
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
          .HasDefaultValue(Access.standard);
      }).HasPostgresEnum<Access>("public", "access_level");

      modelBuilder.Entity<Notification>(entity => {
        entity.ToTable("notifications");

        entity.Property(e => e.Id).HasColumnName("id");

        entity.Property(e => e.AdditionalData)
            .HasColumnType("jsonb")
            .HasColumnName("additional_data");

        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.NotificationType).HasColumnName("notification_type");

        entity.Property(e => e.Url)
            .HasMaxLength(512)
            .HasColumnName("url");
      });

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
            .WithMany(p => p.NotificationReceipt)
            .HasForeignKey(d => d.RecipientId)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("accounts_fk");

        entity.HasOne(d => d.Notification)
            .WithMany(p => p.NotificationReceipt)
            .HasForeignKey(d => d.NotificationFk)
            .OnDelete(DeleteBehavior.ClientSetNull)
            .HasConstraintName("notification_receipt_fk");
      }).HasPostgresEnum<NotificationTypes>("public", "notification_types");

      OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
  }
}
