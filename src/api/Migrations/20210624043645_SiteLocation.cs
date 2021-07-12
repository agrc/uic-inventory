using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class SiteLocation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "address",
                schema: "public",
                table: "sites",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "geometry",
                schema: "public",
                table: "sites",
                type: "jsonb",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "address",
                schema: "public",
                table: "sites");

            migrationBuilder.DropColumn(
                name: "geometry",
                schema: "public",
                table: "sites");
        }
    }
}
