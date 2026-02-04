set -e
cd "$(dirname "$0")/.."

docker-compose down
echo "starting databases"
docker-compose --file docker-compose.yaml --file docker-compose.override.yaml up --detach db cache

# Check if GCP credentials are valid
if ! gcloud auth application-default print-access-token &>/dev/null; then
  echo "authenticating with GCP"
  gcloud auth application-default login
fi

echo "starting api"
cd src/api

# Start API with watch
export ASPNETCORE_ENVIRONMENT=Development
# there is a bug with this currently. must use launch task and dotnet run
# https://github.com/dotnet/aspnetcore/issues/64519
export ASPNETCORE_HOSTINGSTARTUPASSEMBLIES=Microsoft.AspNetCore.SpaProxy
dotnet watch
