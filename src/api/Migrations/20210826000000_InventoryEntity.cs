using System;
using api.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations;
[DbContext(typeof(AppDbContext))]
[Migration("20210826000000_InventoryEntity")]
public class InventoryEntity : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.EnsureSchema(name: "public");

        migrationBuilder.Sql("truncate public.wells;");

        migrationBuilder.AddColumn<int>(
          name: "inventory_fk",
          table: "wells",
          schema: "public",
          type: "integer",
          nullable: false);
        migrationBuilder.AddColumn<int>(
          name: "quantity",
          table: "wells",
          schema: "public",
          type: "integer",
          nullable: false);
        migrationBuilder.AddColumn<string>(
          name: "geometry",
          table: "wells",
          schema: "public",
          type: "jsonb",
          nullable: true);
        migrationBuilder.AddColumn<string>(
          name: "status",
          table: "wells",
          schema: "public",
          type: "character varying(128)",
          nullable: true);
        migrationBuilder.AddColumn<string>(
          name: "description",
          table: "wells",
          schema: "public",
          type: "character varying(512)",
          nullable: true);
        migrationBuilder.AddColumn<string>(
          name: "remediation_description",
          table: "wells",
          schema: "public",
          type: "character varying(512)",
          nullable: true);
        migrationBuilder.AddColumn<string>(
          name: "remediation_project_id",
          table: "wells",
          schema: "public",
          type: "character varying(128)",
          nullable: true);
        migrationBuilder.AddColumn<int>(
          name: "remediation_type",
          table: "wells",
          schema: "public",
          type: "integer",
          nullable: true);
        migrationBuilder.AddColumn<DateTime>(
          name: "created_on",
          table: "wells",
          schema: "public",
          type: "timestamp with time zone",
          defaultValueSql: "CURRENT_TIMESTAMP",
          nullable: false);

        migrationBuilder.DropColumn(
          name: "order_number",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "construction",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "injectate",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "hydrogeologic",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "signature",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "submitted_on",
          table: "wells",
          schema: "public");

        migrationBuilder.CreateTable(
          name: "inventories",
          schema: "public",
          columns: table => new {
              id = table.Column<int>(type: "serial", nullable: false),
              site_fk = table.Column<int>(type: "integer", nullable: false),
              account_fk = table.Column<int>(type: "integer", nullable: false),
              sub_class = table.Column<int>(type: "integer", nullable: false),
              order_number = table.Column<int>(type: "integer", nullable: false),
              signature = table.Column<string>(type: "character varying(128)", nullable: true),
              submitted_on = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
              created_on = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
          },
          constraints: table => {
              table.PrimaryKey("inventory_primary_key", x => x.id);
              table.ForeignKey(
          name: "inventory_to_site_fk",
          column: x => x.site_fk,
          principalSchema: "public",
          principalTable: "sites",
          principalColumn: "id",
          onDelete: ReferentialAction.NoAction);
              table.ForeignKey(
          name: "inventory_to_account_fk",
          column: x => x.account_fk,
          principalSchema: "public",
          principalTable: "accounts",
          principalColumn: "id",
          onDelete: ReferentialAction.NoAction);
          });

        migrationBuilder.CreateIndex(
          name: "ix_inventory_site_fk",
          schema: "public",
          table: "inventories",
          column: "site_fk");

        migrationBuilder.CreateIndex(
          name: "ix_inventory_account_fk",
          schema: "public",
          table: "inventories",
          column: "account_fk");

        migrationBuilder.AddForeignKey(
          name: "well_to_inventory_fk",
          table: "wells",
          column: "inventory_fk",
          principalSchema: "public",
          principalTable: "inventories",
          principalColumn: "id",
          onDelete: ReferentialAction.NoAction);
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.Sql("truncate public.wells;");

        migrationBuilder.DropForeignKey(
          name: "well_to_inventory_fk",
          table: "wells");

        migrationBuilder.DropColumn(
          name: "inventory_fk",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "geometry",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "created_on",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "status",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "quantity",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "description",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "remediation_description",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "remediation_project_id",
          table: "wells",
          schema: "public");
        migrationBuilder.DropColumn(
          name: "remediation_type",
          table: "wells",
          schema: "public");

        migrationBuilder.DropTable(
          name: "inventories",
          schema: "public");

        migrationBuilder.AddColumn<int>(
            name: "order_number",
            schema: "public",
            table: "wells",
            type: "integer",
            nullable: false);
        migrationBuilder.AddColumn<string>(
            name: "construction",
            schema: "public",
            table: "wells",
            type: "character varying(512)",
            maxLength: 512,
            nullable: true);
        migrationBuilder.AddColumn<string>(
            name: "injectate",
            schema: "public",
            table: "wells",
            type: "character varying(512)",
            maxLength: 512,
            nullable: true);
        migrationBuilder.AddColumn<string>(
            name: "hydrogeologic",
            schema: "public",
            table: "wells",
            type: "character varying(512)",
            maxLength: 512,
            nullable: true);
        migrationBuilder.AddColumn<string>(
            name: "signature",
            schema: "public",
            table: "wells",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true);
        migrationBuilder.AddColumn<DateTime?>(
            name: "submitted_on",
            schema: "public",
            table: "wells",
            type: "date",
            nullable: true);
    }
}
