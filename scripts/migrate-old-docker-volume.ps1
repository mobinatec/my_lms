param(
  [string]$Volume = 'codesazan-v5612-production-db_postgres_data'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
New-Item -ItemType Directory -Force -Path '.\data\postgres' | Out-Null
$exists = docker volume ls --format '{{.Name}}' | Where-Object { $_ -eq $Volume }
if (!$exists) { throw "Docker volume '$Volume' was not found. If it was deleted, its data cannot be recovered by this script." }
Write-Host "Stopping Codesazan services before copying PostgreSQL files..."
docker compose down
Write-Host "Copying PostgreSQL data from Docker volume '$Volume' to .\data\postgres ..."
docker run --rm -v "${Volume}:/from:ro" -v "${root}\data\postgres:/to" alpine:3.20 sh -c 'cp -a /from/. /to/'
Write-Host "Migration completed. Start with: docker compose up -d --build"
