using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations;
/// <inheritdoc />
public partial class SiteStringLength : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<string>(
            name: "well_name",
            schema: "public",
            table: "wells",
            type: "character varying(512)",
            maxLength: 512,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(128)",
            oldMaxLength: 128,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "name",
            schema: "public",
            table: "sites",
            type: "character varying(512)",
            maxLength: 512,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(128)",
            oldMaxLength: 128);

        migrationBuilder.AlterColumn<string>(
            name: "naics_title",
            schema: "public",
            table: "sites",
            type: "character varying(512)",
            maxLength: 512,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(128)",
            oldMaxLength: 128);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<string>(
            name: "well_name",
            schema: "public",
            table: "wells",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(512)",
            oldMaxLength: 512,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "name",
            schema: "public",
            table: "sites",
            type: "character varying(128)",
            maxLength: 128,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(512)",
            oldMaxLength: 512);

        migrationBuilder.AlterColumn<string>(
            name: "naics_title",
            schema: "public",
            table: "sites",
            type: "character varying(128)",
            maxLength: 128,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "character varying(512)",
            oldMaxLength: 512);
    }
}
