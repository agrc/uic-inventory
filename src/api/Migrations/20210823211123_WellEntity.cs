using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations {
  public partial class WellEntity : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
      migrationBuilder.EnsureSchema(name: "public");
      migrationBuilder.CreateTable(
      name: "wells",
      schema: "public",
      columns: table => new {
        id = table.Column<int>(type: "serial", nullable: false),
        well_name = table.Column<string>(type: "character varying(128)", maxLength: 512, nullable: true),
        sub_class = table.Column<int>(type: "integer", nullable: false),
        order_number = table.Column<int>(type: "integer", nullable: false),
        construction = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
        injectate = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
        hydrogeologic = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
        signature = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
        submitted_on = table.Column<DateTime?>(type: "date", nullable: true),
        site_fk = table.Column<int>(type: "integer", nullable: false),
        account_fk = table.Column<int>(type: "integer", nullable: false),
      },
      constraints: table => {
        table.PrimaryKey("well_primary_key", x => x.id);
        table.ForeignKey(
          name: "well_to_account_fk",
          column: x => x.account_fk,
          principalSchema: "public",
          principalTable: "accounts",
          principalColumn: "id",
          onDelete: ReferentialAction.NoAction);
        table.ForeignKey(
          name: "well_to_site_fk",
          column: x => x.site_fk,
          principalSchema: "public",
          principalTable: "sites",
          principalColumn: "id",
          onDelete: ReferentialAction.NoAction);
      });

      migrationBuilder.CreateIndex(
          name: "ix_well_site_fk",
          schema: "public",
          table: "wells",
          column: "site_fk");

      migrationBuilder.CreateIndex(
          name: "ix_well_account_fk",
          schema: "public",
          table: "wells",
          column: "account_fk");
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
      migrationBuilder.DropTable(
        name: "wells",
        schema: "public");
  }
}
