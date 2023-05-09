using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations;
/// <inheritdoc />
public partial class WellSiteEditNotificationEnum : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
        => migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:Enum:notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit")
            .OldAnnotation("Npgsql:Enum:notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified");

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
        => migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:Enum:notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified")
            .OldAnnotation("Npgsql:Enum:notification_types", "new_user_account_registration,admin_promotion,inventory_submission,facility_contact_modified,approved_well_status_edit");
}
