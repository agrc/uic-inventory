set -e
cd "$(dirname "$0")/.."

docker compose down
echo "starting databases"
docker compose --file docker-compose.yaml --file docker-compose.override.yaml up --detach db cache
echo "starting front end"
cd src/api/uic-inventory
npm run dev &
echo "starting api"
cd ..
dotnet watch
