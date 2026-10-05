param([Parameter(Mandatory=$true)][string]$File)
$ErrorActionPreference = 'Stop'
Get-Content -Path $File -Encoding Byte | docker compose exec -T postgres pg_restore -U codesazan -d codesazan --clean --if-exists --no-owner
Write-Host "Restore completed from: $File"
