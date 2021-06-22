set -e
cd "$(dirname "$0")/.."

echo 'building image'

docker-compose build --force-rm --pull --progress plain api
