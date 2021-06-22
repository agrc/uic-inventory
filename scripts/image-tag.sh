set -e
cd "$(dirname "$0")/.."

echo 'tagging image'

docker tag uic-inventory/api gcr.io/ut-dts-agrc-uic-inventory-dev/api
