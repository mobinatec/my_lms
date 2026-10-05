$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path -Parent $PSScriptRoot) 'codesazan-production-data'
New-Item -ItemType Directory -Force -Path $root, (Join-Path $root 'postgres'), (Join-Path $root 'redis'), (Join-Path $root 'media') | Out-Null
Write-Host "Stable Codesazan data root: $root"
$legacy = Join-Path (Split-Path -Parent $PSScriptRoot) 'codesazan-v5.6.31-true-persistent-final/data'
if ((Test-Path (Join-Path $legacy 'postgres')) -and -not (Get-ChildItem -Force (Join-Path $root 'postgres') | Select-Object -First 1)) {
  Write-Host 'Stable postgres directory is empty; legacy v5.6.31 data was detected.'
  Write-Host 'Copy it only while PostgreSQL is stopped. No files will be deleted by this script.'
  $answer = Read-Host 'Copy legacy data now? (Y/N)'
  if ($answer -match '^[Yy]$') {
    Copy-Item -Path (Join-Path $legacy 'postgres\*') -Destination (Join-Path $root 'postgres') -Recurse -Force
    if (Test-Path (Join-Path $legacy 'redis')) { Copy-Item -Path (Join-Path $legacy 'redis\*') -Destination (Join-Path $root 'redis') -Recurse -Force }
    if (Test-Path (Join-Path $legacy 'media')) { Copy-Item -Path (Join-Path $legacy 'media\*') -Destination (Join-Path $root 'media') -Recurse -Force }
    Write-Host 'Legacy data copied to the stable root.'
  }
}
Write-Host 'Done. Start with: docker compose up --build'
