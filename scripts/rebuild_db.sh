set -e
cd "$(dirname "$0")/.."

echo "rebuilding database"

docker-compose down --volumes
docker-compose build --no-cache db
