using api.GraphQL;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class SiteStatusEnum : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:site_status", "incomplete,complete,submitted,authorized,ingested");

            migrationBuilder.AddColumn<SiteStatus>(
                name: "status",
                schema: "public",
                table: "sites",
                type: "site_status",
                nullable: false,
                defaultValue: SiteStatus.Incomplete);
        }

    protected override void Down(MigrationBuilder migrationBuilder) {
      migrationBuilder.DropColumn(
        name: "status",
        table: "sites",
        schema: "public");

      migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:Enum:site_status", "incomplete,complete,submitted,authorized,ingested");
    }
  }
}
