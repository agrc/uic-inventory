set -e
cd "$(dirname "$0")/.."

echo "rebuilding database with pgdata.sql"

docker-compose down --volumes
docker-compose build db
