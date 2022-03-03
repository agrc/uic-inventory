# UIC Inventory

## Debugging

```sh
./scripts/watch.sh
```

## Rebuilding database

```sh
./scripts/rebuild_db.sh
```

chmod +x ./scripts/yada yada

## Secrets

```sh
dotnet user-secrets init
dotnet user-secrets set "Redis:Configuration" "localhost:6379"

dotnet user-secrets set "UtahId:Authority" "https://login.dts.utah.gov:443/sso/oauth2"
dotnet user-secrets set "UtahId:ClientId" ""
dotnet user-secrets set "UtahId:ClientSecret" ""

dotnet user-secrets set "CloudSql:Host" "localhost"
dotnet user-secrets set "CloudSql:Port" "5432"
dotnet user-secrets set "CloudSql:Db" "app"
dotnet user-secrets set "CloudSql:Username" "postgres"
dotnet user-secrets set "CloudSql:Password" "what password"

dotnet user-secrets set "App:AdminEmail" "you@email.com"
dotnet user-secrets set "SendGrid:Key" "yor send grid api key"
```
