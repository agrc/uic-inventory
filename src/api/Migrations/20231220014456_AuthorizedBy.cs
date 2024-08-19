using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations;
/// <inheritdoc />
public partial class AuthorizedBy : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AddColumn<int>(
            name: "authorized_by_account_id",
            schema: "public",
            table: "inventories",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "ix_inventories_authorized_by_account_id",
            schema: "public",
            table: "inventories",
            column: "authorized_by_account_id");

        migrationBuilder.AddForeignKey(
            name: "fk_inventories_accounts_authorized_by_account_id",
            schema: "public",
            table: "inventories",
            column: "authorized_by_account_id",
            principalSchema: "public",
            principalTable: "accounts",
            principalColumn: "id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropForeignKey(
            name: "fk_inventories_accounts_authorized_by_account_id",
            schema: "public",
            table: "inventories");

        migrationBuilder.DropIndex(
            name: "ix_inventories_authorized_by_account_id",
            schema: "public",
            table: "inventories");

        migrationBuilder.DropColumn(
            name: "authorized_by_account_id",
            schema: "public",
            table: "inventories");
    }
}
