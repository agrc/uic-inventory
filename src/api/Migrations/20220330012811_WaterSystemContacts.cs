using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations
{
    public partial class WaterSystemContacts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "water_system_contacts",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    site_fk = table.Column<int>(type: "integer", nullable: false),
                    inventory_fk = table.Column<int>(type: "integer", nullable: false),
                    well_fk = table.Column<int>(type: "integer", nullable: false),
                    account_fk = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    system = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    email = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_water_system_contacts", x => x.id);
                    table.ForeignKey(
                        name: "fk_water_system_contacts_inventories_inventory_fk",
                        column: x => x.inventory_fk,
                        principalSchema: "public",
                        principalTable: "inventories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_water_system_contacts_wells_well_fk",
                        column: x => x.well_fk,
                        principalSchema: "public",
                        principalTable: "wells",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_water_system_contacts_inventory_fk",
                schema: "public",
                table: "water_system_contacts",
                column: "inventory_fk");

            migrationBuilder.CreateIndex(
                name: "ix_water_system_contacts_well_fk",
                schema: "public",
                table: "water_system_contacts",
                column: "well_fk");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "water_system_contacts",
                schema: "public");
        }
    }
}
