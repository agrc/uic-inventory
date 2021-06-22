set -e
cd "$(dirname "$0")/.."

echo 'pushing image to gcr'

docker push gcr.io/ut-dts-agrc-uic-inventory-dev/api
