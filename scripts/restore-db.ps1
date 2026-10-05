param([Parameter(Mandatory=$true)][string]$File)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
if (!(Test-Path $File)) { throw "Backup file not found: $File" }
Write-Host "Restoring PostgreSQL backup: $File"
Get-Content -Raw $File | docker compose exec -T postgres psql -U codesazan -d codesazan
Write-Host "Restore completed."
