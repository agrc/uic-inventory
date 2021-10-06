set -e
cd "$(dirname "$0")/../src/api"

echo "migrating database to most current database"

dotnet ef database update --connection "host=127.0.0.1;port=5432;username=postgres;password=what password;database=app"
