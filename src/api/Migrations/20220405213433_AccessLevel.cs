using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations {
  public partial class AccessLevel : Migration {
    protected override void Up(MigrationBuilder migrationBuilder)
      => migrationBuilder.Sql("ALTER TYPE public.\"access_level\" RENAME TO access_levels;");

    protected override void Down(MigrationBuilder migrationBuilder)
      => migrationBuilder.Sql("ALTER TYPE public.\"access_levels\" RENAME TO access_level;");
  }
}
