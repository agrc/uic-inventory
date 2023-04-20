using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations;
public partial class InventoryFlag : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.AddColumn<string>(
            name: "flagged",
            schema: "public",
            table: "inventories",
            type: "text",
            nullable: true);

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropColumn(
            name: "flagged",
            schema: "public",
            table: "inventories");
}
