$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
New-Item -ItemType Directory -Force -Path '.\backups' | Out-Null
$dump = ".\backups\codesazan-$stamp.sql"
Write-Host "Creating PostgreSQL backup: $dump"
docker compose exec -T postgres pg_dump -U codesazan -d codesazan --clean --if-exists | Out-File -Encoding utf8 $dump
Write-Host "Backup completed: $dump"
