$ErrorActionPreference = 'Stop'

$statePath = Join-Path $env:TEMP 'presupuestador-local-services.json'

if (-not (Test-Path $statePath)) {
  Write-Host 'No se encontro una sesion local iniciada por el lanzador.' -ForegroundColor Yellow
  exit 0
}

$state = Get-Content $statePath -Raw | ConvertFrom-Json
$stoppedAny = $false

foreach ($processId in @($state.frontendPid, $state.backendPid)) {
  if (-not $processId) {
    continue
  }

  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($process) {
    & taskkill.exe /PID $processId /T /F 2>$null | Out-Null
    $stoppedAny = $true
  }
}

Remove-Item -LiteralPath $statePath -Force

if ($stoppedAny) {
  Write-Host 'Frontend y backend detenidos.' -ForegroundColor Green
}
else {
  Write-Host 'Los servicios ya estaban detenidos.' -ForegroundColor Yellow
}
