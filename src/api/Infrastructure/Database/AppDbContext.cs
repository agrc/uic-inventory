using System;
using api.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Infrastructure {
  public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
      modelBuilder.Entity<Account>(entity => {
        entity.ToTable("accounts", "public");
        entity.Property(e => e.Id).HasColumnName("id");
        entity.HasKey(e => e.Id).HasName("accounts_pkey");

        entity.Property(e => e.UtahId).HasColumnName("utah_id").HasMaxLength(128);
        entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(512);
        entity.Property(e => e.FirstName).HasColumnName("first_name").HasMaxLength(128);
        entity.Property(e => e.LastName).HasColumnName("last_name").HasMaxLength(128);
        entity.Property(e => e.Access).HasColumnName("account_access");
      }).HasPostgresEnum<Access>("public", "access_level");

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) {
      NpgsqlConnection.GlobalTypeMapper.MapEnum<Access>("access_level");
    }

    public DbSet<Account> Accounts { get; set; } = default!;
  }
}
