# UIC Inventory

## Debugging

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
```
