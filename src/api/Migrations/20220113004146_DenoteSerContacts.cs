using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations;
public partial class DenoteSerContacts : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.AddColumn<bool>(
            name: "ser_contact",
            schema: "public",
            table: "contacts",
            type: "boolean",
            nullable: false,
            defaultValue: false);

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropColumn(
            name: "ser_contact",
            schema: "public",
            table: "contacts");
}
