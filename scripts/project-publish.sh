set -e

cd "$(dirname "$0")/.."

echo 'cleaning'
dotnet clean --nologo ./src/api/api.csproj --verbosity quiet

echo 'creating publish files'
dotnet publish ./src/api/api.csproj -c Release -r linux-x64 --no-self-contained
