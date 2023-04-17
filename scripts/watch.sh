set -e
cd "$(dirname "$0")/.."

podman-compose down
echo "starting databases"
podman-compose --file docker-compose.yaml --file docker-compose.override.yaml up --detach db cache

echo "authenticating with GCP"
gcloud auth application-default login

echo "starting api"
cd src/api
dotnet watch
