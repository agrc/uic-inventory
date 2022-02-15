using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations {
  public partial class SurfaceWaterProtection : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) =>
      migrationBuilder.AddColumn<string>(
        name: "surface_water_protection",
        schema: "public",
        table: "wells",
        type: "text",
        nullable: true);

    protected override void Down(MigrationBuilder migrationBuilder) =>
      migrationBuilder.DropColumn(
        name: "surface_water_protection",
        table: "wells",
        schema: "public");
  }
}
