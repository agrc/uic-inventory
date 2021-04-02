set -e

cd "$(dirname "$0")/.."

dotnet build ./src/api/api.csproj
