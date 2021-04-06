using System;
using api.Entities;
using api.Features.UserRegistration;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Infrastructure {
  public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder) => modelBuilder.Entity<Account>(entity => {
      entity.ToTable("accounts", "public");

      entity.Property(e => e.Id).HasColumnName("id");
      entity.HasKey(e => e.Id).HasName("accounts_primary_key");

      entity.Property(e => e.UtahId).HasColumnName("utah_id").HasMaxLength(128);
      entity.HasKey(e => e.UtahId).HasName("accounts_utah_id_key");

      entity.Property(e => e.FirstName).HasColumnName("first_name").HasMaxLength(128);
      entity.Property(e => e.LastName).HasColumnName("last_name").HasMaxLength(128);
      entity.Property(e => e.Organization).HasColumnName("organization").HasMaxLength(512);
      entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(512);
      entity.Property(e => e.PhoneNumber).HasColumnName("phone").HasMaxLength(64);
      entity.Property(e => e.MailingAddress).HasColumnName("mailing_address").HasMaxLength(512);
      entity.Property(e => e.City).HasColumnName("city").HasMaxLength(128);
      entity.Property(e => e.State).HasColumnName("state").HasMaxLength(128);
      entity.Property(e => e.ZipCode).HasColumnName("zip_code");

      entity.Property(e => e.ReceiveNotifications).HasColumnName("receive_notifications").HasDefaultValue(false);
      entity.Property(e => e.Access).HasColumnName("account_access").HasDefaultValue(Access.standard);
    }).HasPostgresEnum<Access>("public", "access_level");

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
      => NpgsqlConnection.GlobalTypeMapper.MapEnum<Access>("access_level");

    public DbSet<Account> Accounts { get; set; } = default!;
  }
}
