$ErrorActionPreference = 'Stop'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
New-Item -ItemType Directory -Force -Path '.\backups' | Out-Null
docker compose exec -T postgres pg_dump -U codesazan -d codesazan -Fc > ".\backups\codesazan-$stamp.dump"
Write-Host "Backup created: .\backups\codesazan-$stamp.dump"
