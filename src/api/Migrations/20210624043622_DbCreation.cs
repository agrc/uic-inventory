using System;
using System.Collections.Generic;
using System.Linq;
using api.Features;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace api.Migrations;
public partial class DbCreation : Migration {
    private void SafelyCreateEnum(string name, string[] values, MigrationBuilder migrationBuilder) =>
    migrationBuilder.Sql(@$"DO $$ BEGIN
    CREATE TYPE {name} AS ENUM ({values.Select(v => $"'{v}'").Aggregate((a, b) => $"{a}, {b}")});
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;");
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.EnsureSchema(name: "public");

        SafelyCreateEnum("public.\"access_level\"", new[] { "standard", "elevated" }, migrationBuilder);
        SafelyCreateEnum("public.contact_types", new[] { "owner_operator", "facility_owner", "facility_operator", "facility_manager", "legal_rep", "official_rep", "contractor", "health_dept", "permit_writer", "developer", "other", "project_manager" }, migrationBuilder);
        SafelyCreateEnum("public.notification_types", new[] { "new_user_account_registration", "facility_contact_modified" }, migrationBuilder);

        migrationBuilder.CreateTable(
            name: "accounts",
            schema: "public",
            columns: table => new {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                utah_id = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                first_name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                last_name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                organization = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                email = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                phone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                mailing_address = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                city = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                state = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                zip_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                receive_notifications = table.Column<bool>(type: "boolean", nullable: true, defaultValueSql: "false"),
                complete_profile = table.Column<bool>(type: "boolean", nullable: false, computedColumnSql: "\nCASE\n    WHEN ((length((organization)::text) > 0) AND (length((email)::text) > 0) AND (length((phone)::text) > 0) AND (length((mailing_address)::text) > 0) AND (length((city)::text) > 0) AND (length((state)::text) > 0) AND (length((zip_code)::text) > 0)) THEN true\n    ELSE false\nEND", stored: true),
                account_access = table.Column<AccessLevels>(type: "access_level", nullable: false, defaultValue: AccessLevels.standard)
            },
            constraints: table => {
                table.PrimaryKey("pk_accounts", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "notifications",
            schema: "public",
            columns: table => new {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "now()"),
                url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                additional_data = table.Column<Dictionary<string, object>>(type: "jsonb", nullable: true),
                notification_type = table.Column<NotificationTypes>(type: "notification_types", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("pk_notifications", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "sites",
            schema: "public",
            columns: table => new {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                ownership = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                naics_primary = table.Column<int>(type: "integer", nullable: true),
                naics_title = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                account_fk = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("pk_sites", x => x.id);
                table.ForeignKey(
                    name: "site_to_account_fk",
                    column: x => x.account_fk,
                    principalSchema: "public",
                    principalTable: "accounts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "notification_receipts",
            schema: "public",
            columns: table => new {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                read_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                deleted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                recipient_id = table.Column<int>(type: "integer", nullable: false),
                notification_fk = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("pk_notification_receipts", x => x.id);
                table.ForeignKey(
                    name: "accounts_fk",
                    column: x => x.recipient_id,
                    principalSchema: "public",
                    principalTable: "accounts",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "notification_receipt_fk",
                    column: x => x.notification_fk,
                    principalSchema: "public",
                    principalTable: "notifications",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "contacts",
            schema: "public",
            columns: table => new {
                id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                first_name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                last_name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                organization = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                email = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                phone = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                mailing_address = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                city = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                state = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                zip_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                contact_type = table.Column<ContactTypes>(type: "contact_types", nullable: false),
                site_fk = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("pk_contacts", x => x.id);
                table.ForeignKey(
                    name: "contact_to_site_fk",
                    column: x => x.site_fk,
                    principalSchema: "public",
                    principalTable: "sites",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "ix_accounts_utah_id",
            schema: "public",
            table: "accounts",
            column: "utah_id",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_contacts_site_fk",
            schema: "public",
            table: "contacts",
            column: "site_fk");

        migrationBuilder.CreateIndex(
            name: "ix_notification_receipts_notification_fk",
            schema: "public",
            table: "notification_receipts",
            column: "notification_fk");

        migrationBuilder.CreateIndex(
            name: "ix_notification_receipts_recipient_id",
            schema: "public",
            table: "notification_receipts",
            column: "recipient_id");

        migrationBuilder.CreateIndex(
            name: "ix_sites_account_fk",
            schema: "public",
            table: "sites",
            column: "account_fk");
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(
            name: "contacts",
            schema: "public");

        migrationBuilder.DropTable(
            name: "notification_receipts",
            schema: "public");

        migrationBuilder.DropTable(
            name: "sites",
            schema: "public");

        migrationBuilder.DropTable(
            name: "notifications",
            schema: "public");

        migrationBuilder.DropTable(
            name: "accounts",
            schema: "public");

        migrationBuilder.Sql("DROP TYPE IF EXISTS public.\"access_level\";");
        migrationBuilder.Sql("DROP TYPE IF EXISTS public.contact_types;");
        migrationBuilder.Sql("DROP TYPE IF EXISTS public.notification_types;");
    }
}
