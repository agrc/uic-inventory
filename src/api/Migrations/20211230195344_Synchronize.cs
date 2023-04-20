using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations;
public partial class Synchronize : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<DateTime>(
           name: "created_at",
           schema: "public",
           table: "notifications",
           type: "timestamp with time zone",
           nullable: false,
           defaultValueSql: "now()",
           oldClrType: typeof(DateTime),
           oldType: "timestamp without time zone",
           oldDefaultValueSql: "now()");

        migrationBuilder.AlterColumn<DateTime>(
            name: "read_at",
            schema: "public",
            table: "notification_receipts",
            type: "timestamp with time zone",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "timestamp without time zone",
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "deleted_at",
            schema: "public",
            table: "notification_receipts",
            type: "timestamp with time zone",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "timestamp without time zone",
            oldNullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.AlterColumn<DateTime>(
            name: "created_at",
            schema: "public",
            table: "notifications",
            type: "timestamp without time zone",
            nullable: false,
            defaultValueSql: "now()",
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone",
            oldDefaultValueSql: "now()");

        migrationBuilder.AlterColumn<DateTime>(
            name: "read_at",
            schema: "public",
            table: "notification_receipts",
            type: "timestamp without time zone",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone",
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "deleted_at",
            schema: "public",
            table: "notification_receipts",
            type: "timestamp without time zone",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone",
            oldNullable: true);
    }
}
