using api.Features;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations;
public partial class InventoryStatusEnum : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterDatabase()
       .Annotation("Npgsql:Enum:inventory_status", "incomplete,complete,submitted,authorized,ingested");

        migrationBuilder.AddColumn<bool>(
            name: "contact_status",
            schema: "public",
            table: "inventories",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "detail_status",
            schema: "public",
            table: "inventories",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "location_status",
            schema: "public",
            table: "inventories",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "payment_status",
            schema: "public",
            table: "inventories",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<bool>(
            name: "signature_status",
            schema: "public",
            table: "inventories",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<InventoryStatus>(
            name: "status",
            schema: "public",
            table: "inventories",
            type: "inventory_status",
            nullable: false,
            defaultValue: InventoryStatus.Incomplete);
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "contact_status",
            table: "inventories",
            schema: "public");

        migrationBuilder.DropColumn(
            name: "detail_status",
            table: "inventories",
            schema: "public");

        migrationBuilder.DropColumn(
            name: "location_status",
            table: "inventories",
            schema: "public");

        migrationBuilder.DropColumn(
            name: "payment_status",
            table: "inventories",
            schema: "public");

        migrationBuilder.DropColumn(
            name: "signature_status",
            table: "inventories",
            schema: "public");

        migrationBuilder.DropColumn(
            name: "status",
            table: "inventories",
            schema: "public");

        migrationBuilder.AlterDatabase()
          .OldAnnotation("Npgsql:Enum:inventory_status", "incomplete,complete,submitted,authorized,ingested");
    }
}
