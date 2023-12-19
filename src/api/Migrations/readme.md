# Migrations

Make sure the entity framework tools match the installed version

`dotnet tool update --global dotnet-ef`

## Create a migration

1. Stop any active api.dll projects
1. From the `src/api` project create the migration

`dotnet ef migrations add NameOfMigration`

## Apply a migration

### Format

`dotnet ef database update --connection "database;host;port;username;password;"`

### Development

`dotnet ef database update --connection "host=127.0.0.1;port=5432;username=postgres;password=what password;database=app"`

> [!TIP]
> You may have to start the cloud sql proxy

`./cloud_sql_proxy -instances=ut-dts-agrc-uic-inventory-dev:us-central1:app=tcp:5432`
