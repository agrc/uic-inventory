# UIC Inventory

[![Release Events](https://github.com/agrc/uic-inventory/actions/workflows/release.yml/badge.svg)](https://github.com/agrc/uic-inventory/actions/workflows/release.yml)

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

### API secrets

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

dotnet user-secrets set "SendGrid:Key" "your send grid api key"

dotnet user-secrets set "UPLOAD_BUCKET" "the gcp storage bucket where uploaded files are processed"
dotnet user-secrets set "STORAGE_BUCKET" "the gcp bucket where scanned files are stored"

dotnet user-secrets set "GroundWaterContacts:Connection" "the connection string for the ground water contacts database"
```

### App secrets

1. Duplicate `./src/api/uic-inventory/.env` to `./src/api/uic-inventory/.env.local` and add an API key.

## Deployment

> [!WARNING]
> There are a lot of chicken and egg issues with this project deployment.

### API deployment

1. Request the Cloud Run service account is attached to the DTS shared VPC
1. Request an authorized network for the Memorystore Redis
1. Update those values in the terraform and apply the plan. It will fail.
1. Update the `secret-appsettings` with the database password, redis URI, UtahID client information, and report function URI.

### Malware scanner deployment

1. Run the `Scheduled Events` GitHub Action to create the clam AV data
1. Run the `Workflow Dispatch Events` GitHub Action to create the clam AV Cloud Run

1. Rerun the terraform
