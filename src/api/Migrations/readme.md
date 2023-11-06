# Migrations

Make sure the entity framework tools match the installed version

`dotnet tools update --global dotnet-ef`

## Create a migration

1. Stop any active api.dll projects
1. From the `src/api` project create the migration

  `dotnet ef migrations add NameOfMigration`

## Apply a migration

`dotnet ef database update --connection "database;host;port;username;password;"`
