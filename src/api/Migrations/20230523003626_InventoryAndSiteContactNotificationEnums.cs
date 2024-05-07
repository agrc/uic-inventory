using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations;
/// <inheritdoc />
public partial class InventoryAndSiteContactNotificationEnums : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit,approved_inventory_well_addition,approved_site_contact_addition,approved_site_contact_deletion")
            .OldAnnotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit");

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit")
            .OldAnnotation("Npgsql:Enum:public.notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit,approved_inventory_well_addition,approved_site_contact_addition,approved_site_contact_deletion");
}
