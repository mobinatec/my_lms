$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function New-RandomSecret([int]$Bytes = 48) {
  $b = New-Object byte[] $Bytes
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($b) } finally { $rng.Dispose() }
  return ([Convert]::ToBase64String($b) -replace '[^A-Za-z0-9]', '')
}

function Get-EnvValue([string[]]$Lines, [string]$Name) {
  foreach ($line in $Lines) {
    if ($line -match "^$([regex]::Escape($Name))=(.*)$") { return $Matches[2] }
  }
  return $null
}

function Set-OrAppend-Env([System.Collections.Generic.List[string]]$Lines, [string]$Name, [string]$Value) {
  $pattern = "^$([regex]::Escape($Name))="
  for ($i = 0; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i] -match $pattern) {
      if ([string]::IsNullOrWhiteSpace(($Lines[$i] -split '=',2)[1])) { $Lines[$i] = "$Name=$Value" }
      return
    }
  }
  $Lines.Add("$Name=$Value")
}

if (Test-Path .env) {
  $lines = [System.Collections.Generic.List[string]]::new()
  Get-Content .env | ForEach-Object { [void]$lines.Add($_) }

  $changed = $false
  if ([string]::IsNullOrWhiteSpace((Get-EnvValue $lines 'INTEGRATION_CONFIG_KEY')) -or (Get-EnvValue $lines 'INTEGRATION_CONFIG_KEY') -eq 'replace-with-a-long-random-secret-at-least-32-chars') {
    Set-OrAppend-Env $lines 'INTEGRATION_CONFIG_KEY' (New-RandomSecret 48)
    $changed = $true
  }
  if ([string]::IsNullOrWhiteSpace((Get-EnvValue $lines 'IMAGE_MAX_UPLOAD_BYTES'))) {
    Set-OrAppend-Env $lines 'IMAGE_MAX_UPLOAD_BYTES' '10485760'
    $changed = $true
  }
  if ([string]::IsNullOrWhiteSpace((Get-EnvValue $lines 'FILE_MAX_UPLOAD_BYTES'))) {
    Set-OrAppend-Env $lines 'FILE_MAX_UPLOAD_BYTES' '26214400'
    $changed = $true
  }
  if ([string]::IsNullOrWhiteSpace((Get-EnvValue $lines 'PUBLIC_BASE_URL'))) {
    Set-OrAppend-Env $lines 'PUBLIC_BASE_URL' 'http://localhost'
    $changed = $true
  }
  if ([string]::IsNullOrWhiteSpace((Get-EnvValue $lines 'DB_STATEMENT_TIMEOUT_MS'))) {
    Set-OrAppend-Env $lines 'DB_STATEMENT_TIMEOUT_MS' '30000'
    $changed = $true
  }
  if ([string]::IsNullOrWhiteSpace((Get-EnvValue $lines 'DB_QUERY_TIMEOUT_MS'))) {
    Set-OrAppend-Env $lines 'DB_QUERY_TIMEOUT_MS' '35000'
    $changed = $true
  }

  if ($changed) {
    Set-Content -Path .env -Value $lines -Encoding ascii
    Write-Host '.env existed and was safely completed with missing production settings.' -ForegroundColor Green
  } else {
    Write-Host '.env is already complete; existing secrets were left unchanged.' -ForegroundColor Green
  }
  Write-Host 'Run docker compose up --build when ready.'
  exit 0
}

$auth = New-RandomSecret 48
$db = New-RandomSecret 36
$admin = New-RandomSecret 18
$integration = New-RandomSecret 48

@"
POSTGRES_DB=codesazan
POSTGRES_USER=codesazan
POSTGRES_PASSWORD=$db
AUTH_SECRET=$auth
ADMIN_PASSWORD=$admin
ADMIN_PASSWORD_HASH=
CORS_ORIGIN=http://localhost
STORAGE_PROVIDER=local
DB_POOL_MAX=20
EDGE_PORT=80
MEDIA_MAX_UPLOAD_BYTES=524288000
IMAGE_MAX_UPLOAD_BYTES=10485760
FILE_MAX_UPLOAD_BYTES=26214400
DATA_ROOT=../codesazan-production-data
BOOTSTRAP_RETRIES=30
TRUST_PROXY=1
RATE_LIMIT=240
JSON_LIMIT=2mb
PAYMENT_PROVIDER=disabled
SEED_DEMO_USERS=false
DB_STATEMENT_TIMEOUT_MS=30000
DB_QUERY_TIMEOUT_MS=35000
DEMO_PASSWORD=
INTEGRATION_CONFIG_KEY=$integration
PUBLIC_BASE_URL=http://localhost
"@ | Set-Content -Path .env -Encoding ascii

Write-Host ''
Write-Host 'Production environment created successfully.' -ForegroundColor Green
Write-Host 'A unique database password, AUTH_SECRET, INTEGRATION_CONFIG_KEY and initial admin password were generated.'
Write-Host ''
Write-Host 'IMPORTANT: save the locally generated admin password now. It is not included in the distribution ZIP:' -ForegroundColor Yellow
Write-Host $admin -ForegroundColor Cyan
Write-Host ''
Write-Host 'Then start the stack with:' -ForegroundColor Green
Write-Host 'docker compose up --build'
Write-Host ''
Write-Host 'For the hardened profile:' -ForegroundColor Green
Write-Host 'docker compose -f docker-compose.yml -f docker-compose.production.yml up --build -d'
