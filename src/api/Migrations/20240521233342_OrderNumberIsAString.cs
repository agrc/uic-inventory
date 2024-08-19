using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations; 
/// <inheritdoc />
public partial class OrderNumberIsAString : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.AlterColumn<string>(
            name: "order_number",
            schema: "public",
            table: "inventories",
            type: "character varying(8)",
            maxLength: 8,
            nullable: false,
            oldClrType: typeof(int),
            oldType: "integer",
            oldMaxLength: 128);

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.AlterColumn<int>(
            name: "order_number",
            schema: "public",
            table: "inventories",
            type: "integer",
            maxLength: 128,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(8)",
            oldMaxLength: 8);
}
