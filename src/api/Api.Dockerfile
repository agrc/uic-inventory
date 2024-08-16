FROM node:lts-alpine AS nodejs
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS dotnet
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-sdk

FROM nodejs AS vite-build
WORKDIR /build

COPY ./src/api/uic-inventory .

ARG NODE_OPTIONS=--max_old_space_size=4096
ARG VITE_API_KEY $VITE_API_KEY

RUN npm ci && npm run build

FROM dotnet-sdk AS api-build

COPY . ./build
WORKDIR /build/src/api

RUN dotnet build -c Release -o /app

FROM api-build AS api-publish

RUN dotnet publish -c Release -o /app -r linux-x64 -p:PublishSingleFile=true --no-self-contained -p:DebugType=embedded -p:PublishReadyToRun=true

FROM dotnet AS final
WORKDIR /app

COPY --from=api-publish /app .
COPY --from=vite-build /build/dist ./uic-inventory/dist

RUN useradd -s /bin/bash dummy
USER dummy

ENTRYPOINT ["dotnet", "api.dll"]
