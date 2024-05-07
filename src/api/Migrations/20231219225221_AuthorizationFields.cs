using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations; 
/// <inheritdoc />
public partial class AuthorizationFields : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterDatabase(
            collation: "en_US.utf8",
            oldCollation: "en_US.utf8")
            .Annotation("Npgsql:Enum:access_levels", "elevated,standard")
            .Annotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
            .Annotation("Npgsql:Enum:notification_types", "new_user_account_registration")
            .Annotation("Npgsql:Enum:public.access_levels", "standard,elevated")
            .Annotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
            .Annotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,inventory_authorized,facility_contact_modified,approved_well_status_edit,approved_inventory_well_addition,approved_site_contact_addition,approved_site_contact_deletion")
            .OldAnnotation("Npgsql:Enum:access_levels", "elevated,standard")
            .OldAnnotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
            .OldAnnotation("Npgsql:Enum:notification_types", "new_user_account_registration")
            .OldAnnotation("Npgsql:Enum:public.access_levels", "standard,elevated")
            .OldAnnotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
            .OldAnnotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit,approved_inventory_well_addition,approved_site_contact_addition,approved_site_contact_deletion");

        migrationBuilder.AddColumn<DateTime>(
            name: "authorized_on",
            schema: "public",
            table: "inventories",
            type: "timestamp with time zone",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropColumn(
            name: "authorized_on",
            schema: "public",
            table: "inventories");

        migrationBuilder.AlterDatabase(
            collation: "en_US.utf8",
            oldCollation: "en_US.utf8")
            .Annotation("Npgsql:Enum:access_levels", "elevated,standard")
            .Annotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
            .Annotation("Npgsql:Enum:notification_types", "new_user_account_registration")
            .Annotation("Npgsql:Enum:public.access_levels", "standard,elevated")
            .Annotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
            .Annotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit,approved_inventory_well_addition,approved_site_contact_addition,approved_site_contact_deletion")
            .OldAnnotation("Npgsql:Enum:access_levels", "elevated,standard")
            .OldAnnotation("Npgsql:Enum:contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,health_dept,permit_writer,developer,other,project_manager")
            .OldAnnotation("Npgsql:Enum:notification_types", "new_user_account_registration")
            .OldAnnotation("Npgsql:Enum:public.access_levels", "standard,elevated")
            .OldAnnotation("Npgsql:Enum:public.contact_types", "owner_operator,facility_owner,facility_operator,facility_manager,legal_rep,official_rep,contractor,project_manager,health_dept,permit_writer,developer,other")
            .OldAnnotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,inventory_authorized,facility_contact_modified,approved_well_status_edit,approved_inventory_well_addition,approved_site_contact_addition,approved_site_contact_deletion");
    }
}
