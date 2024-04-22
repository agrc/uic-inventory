using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations {
    /// <inheritdoc />
    public partial class StatusRefactors : Migration {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder) {
            migrationBuilder.Sql(@"
                ALTER TABLE inventories ALTER COLUMN status DROP DEFAULT;
                CREATE TYPE inventory_status_new AS ENUM('incomplete', 'complete', 'submitted', 'under_review', 'approved', 'authorized', 'completed');
                ALTER TABLE inventories ALTER COLUMN status TYPE inventory_status_new USING status::text::inventory_status_new;
                DROP TYPE inventory_status;
                ALTER TYPE inventory_status_new RENAME TO inventory_status;
                ALTER TABLE inventories ALTER COLUMN status SET DEFAULT 'incomplete'
            ");

            migrationBuilder.Sql("ALTER TYPE notification_types ADD VALUE 'inventory_under_review'");
            migrationBuilder.Sql("ALTER TYPE notification_types ADD VALUE 'inventory_approved'");
            migrationBuilder.Sql("ALTER TYPE notification_types ADD VALUE 'inventory_completed'");

            migrationBuilder.AddColumn<int>(
                name: "approved_by_account_id",
                schema: "public",
                table: "inventories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "approved_on",
                schema: "public",
                table: "inventories",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "completed_by_account_id",
                schema: "public",
                table: "inventories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "completed_on",
                schema: "public",
                table: "inventories",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "under_review_by_account_id",
                schema: "public",
                table: "inventories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "under_review_on",
                schema: "public",
                table: "inventories",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_inventories_approved_by_account_id",
                schema: "public",
                table: "inventories",
                column: "approved_by_account_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventories_completed_by_account_id",
                schema: "public",
                table: "inventories",
                column: "completed_by_account_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventories_under_review_by_account_id",
                schema: "public",
                table: "inventories",
                column: "under_review_by_account_id");

            migrationBuilder.AddForeignKey(
                name: "fk_inventories_accounts_approved_by_account_id",
                schema: "public",
                table: "inventories",
                column: "approved_by_account_id",
                principalSchema: "public",
                principalTable: "accounts",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_inventories_accounts_completed_by_account_id",
                schema: "public",
                table: "inventories",
                column: "completed_by_account_id",
                principalSchema: "public",
                principalTable: "accounts",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_inventories_accounts_under_review_by_account_id",
                schema: "public",
                table: "inventories",
                column: "under_review_by_account_id",
                principalSchema: "public",
                principalTable: "accounts",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder) {
            migrationBuilder.Sql(@"
                ALTER TABLE inventories ALTER COLUMN status DROP DEFAULT;
                CREATE TYPE inventory_status_new AS ENUM('incomplete', 'complete', 'submitted', 'authorized', 'ingested');
                ALTER TABLE inventories ALTER COLUMN status TYPE inventory_status_new USING status::text::inventory_status_new;
                DROP TYPE inventory_status;
                ALTER TYPE inventory_status_new RENAME TO inventory_status;
                ALTER TABLE inventories ALTER COLUMN status SET DEFAULT 'incomplete';
            ");

            migrationBuilder.Sql(@"
                CREATE TYPE notification_types_new AS ENUM ( 'new_user_account_registration', 'inventory_submission', 'admin_promotion', 'inventory_authorized', 'facility_contact_modified', 'approved_well_status_edit', 'approved_inventory_well_addition', 'approved_site_contact_addition', 'approved_site_contact_deletion');
                ALTER TABLE notifications ALTER COLUMN notification_type TYPE notification_types_new USING notification_type::text::notification_types_new;
                DROP TYPE notification_types;
                ALTER TYPE notification_types_new RENAME TO notification_types;
            ");

            migrationBuilder.DropForeignKey(
                name: "fk_inventories_accounts_approved_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropForeignKey(
                name: "fk_inventories_accounts_completed_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropForeignKey(
                name: "fk_inventories_accounts_under_review_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropIndex(
                name: "ix_inventories_approved_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropIndex(
                name: "ix_inventories_completed_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropIndex(
                name: "ix_inventories_under_review_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropColumn(
                name: "approved_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropColumn(
                name: "approved_on",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropColumn(
                name: "completed_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropColumn(
                name: "completed_on",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropColumn(
                name: "under_review_by_account_id",
                schema: "public",
                table: "inventories");

            migrationBuilder.DropColumn(
                name: "under_review_on",
                schema: "public",
                table: "inventories");
        }
    }
}
