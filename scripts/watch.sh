set -e
cd "$(dirname "$0")/.."

docker compose down
echo "starting databases"
docker compose up --detach db cache
echo "starting api"
dotnet watch --project ./src/api/api.csproj run
