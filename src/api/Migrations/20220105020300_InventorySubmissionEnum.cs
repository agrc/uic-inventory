using Microsoft.EntityFrameworkCore.Migrations;
using api.Features;

#nullable disable

namespace api.Migrations
{
    public partial class InventorySubmissionEnum : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase(
                collation: "en_US.utf8",
                oldCollation: "en_US.utf8")
                .Annotation("Npgsql:Enum:access_level", "elevated,standard")
                .Annotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
                .Annotation("Npgsql:Enum:notification_types", "new_user_account_registration")
                .Annotation("Npgsql:Enum:public.access_level", "standard,elevated")
                .Annotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
                .Annotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,inventory_submission,facility_contact_modified")
                .OldAnnotation("Npgsql:Enum:access_level", "elevated,standard")
                .OldAnnotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
                .OldAnnotation("Npgsql:Enum:notification_types", "new_user_account_registration")
                .OldAnnotation("Npgsql:Enum:public.access_level", "standard,elevated")
                .OldAnnotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
                .OldAnnotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,facility_contact_modified");

            migrationBuilder.AlterColumn<InventoryStatus>(
                name: "status",
                schema: "public",
                table: "inventories",
                type: "inventory_status",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase(
                collation: "en_US.utf8",
                oldCollation: "en_US.utf8")
                .Annotation("Npgsql:Enum:access_level", "elevated,standard")
                .Annotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
                .Annotation("Npgsql:Enum:notification_types", "new_user_account_registration")
                .Annotation("Npgsql:Enum:public.access_level", "standard,elevated")
                .Annotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
                .Annotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,facility_contact_modified")
                .OldAnnotation("Npgsql:Enum:access_level", "elevated,standard")
                .OldAnnotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
                .OldAnnotation("Npgsql:Enum:notification_types", "new_user_account_registration")
                .OldAnnotation("Npgsql:Enum:public.access_level", "standard,elevated")
                .OldAnnotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
                .OldAnnotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,inventory_submission,facility_contact_modified");

            migrationBuilder.AlterColumn<int>(
                name: "status",
                schema: "public",
                table: "inventories",
                type: "integer",
                nullable: false,
                oldClrType: typeof(InventoryStatus),
                oldType: "inventory_status");
        }
    }
}
