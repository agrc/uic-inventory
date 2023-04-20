using api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations;
[DbContext(typeof(AppDbContext))]
[Migration("20210907000000_WellDescription")]
public class WelLDescription : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.EnsureSchema(name: "public");

        migrationBuilder.AddColumn<string>(
          name: "construction_details",
          table: "wells",
          schema: "public",
          type: "character varying(2500)",
          nullable: true);
        migrationBuilder.AddColumn<string>(
          name: "injectate_characterization",
          table: "wells",
          schema: "public",
          type: "character varying(2500)",
          nullable: true);
        migrationBuilder.AddColumn<string>(
          name: "hydrogeologic_characterization",
          table: "wells",
          schema: "public",
          type: "character varying(2500)",
          nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
          name: "construction_details",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "injectate_characterization",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "hydrogeologic_characterization",
          table: "wells",
          schema: "public");
    }
}
