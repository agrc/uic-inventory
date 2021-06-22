set -e
cd "$(dirname "$0")/.."

./scripts/image-build.sh
./scripts/image-tag.sh
./scripts/image-push.sh
