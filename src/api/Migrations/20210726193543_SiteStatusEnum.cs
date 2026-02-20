using api.Features;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations;
public partial class SiteStatusEnum : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:Enum:site_status", "incomplete,complete,submitted,authorized,ingested");

        migrationBuilder.AddColumn<SiteStatus>(
            name: "status",
            schema: "public",
            table: "sites",
            type: "site_status",
            nullable: false,
          defaultValueSql: "'incomplete'::public.site_status");

        migrationBuilder.AddColumn<bool>(
            name: "detail_status",
            schema: "public",
            table: "sites",
            type: "bool",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "contact_status",
            schema: "public",
            table: "sites",
            type: "bool",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "location_status",
            schema: "public",
            table: "sites",
            type: "bool",
            nullable: false,
            defaultValue: false);
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
          name: "status",
          table: "sites",
          schema: "public");

        migrationBuilder.DropColumn(
          name: "detail_status",
          table: "sites",
          schema: "public");

        migrationBuilder.DropColumn(
          name: "contact_status",
          table: "sites",
          schema: "public");

        migrationBuilder.DropColumn(
          name: "location_status",
          table: "sites",
          schema: "public");

        migrationBuilder.AlterDatabase()
            .OldAnnotation("Npgsql:Enum:site_status", "incomplete,complete,submitted,authorized,ingested");
    }
}
