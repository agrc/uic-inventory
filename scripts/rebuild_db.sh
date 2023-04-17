set -e
cd "$(dirname "$0")/.."

echo "rebuilding database"

podman-compose down --volumes
podman-compose build --no-cache db
