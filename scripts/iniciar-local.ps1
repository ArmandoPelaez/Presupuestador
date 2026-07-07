param(
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'
$statePath = Join-Path $env:TEMP 'presupuestador-local-services.json'

function Test-LocalPort {
  param([int]$Port)

  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $asyncResult = $client.BeginConnect('127.0.0.1', $Port, $null, $null)
    if (-not $asyncResult.AsyncWaitHandle.WaitOne(300)) {
      return $false
    }

    $client.EndConnect($asyncResult)
    return $true
  }
  catch {
    return $false
  }
  finally {
    $client.Close()
  }
}

function Wait-LocalPort {
  param(
    [int]$Port,
    [string]$ServiceName,
    [int]$TimeoutSeconds = 90
  )

  $limit = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $limit) {
    if (Test-LocalPort -Port $Port) {
      Write-Host "$ServiceName disponible en el puerto $Port." -ForegroundColor Green
      return
    }

    Start-Sleep -Milliseconds 750
  }

  throw "$ServiceName no respondio en el puerto $Port dentro de $TimeoutSeconds segundos. Revise su ventana minimizada."
}

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  throw 'Node.js no esta disponible en PATH.'
}

if (-not (Test-Path (Join-Path $backendPath 'node_modules'))) {
  throw 'Faltan dependencias del backend. Ejecute npm install dentro de backend.'
}

if (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
  throw 'Faltan dependencias del frontend. Ejecute npm install dentro de frontend.'
}

$state = [ordered]@{
  backendPid = $null
  frontendPid = $null
}

if (Test-Path $statePath) {
  try {
    $previousState = Get-Content $statePath -Raw | ConvertFrom-Json
    $state.backendPid = $previousState.backendPid
    $state.frontendPid = $previousState.frontendPid
  }
  catch {
    # Un estado anterior invalido no debe impedir el inicio.
  }
}

if (Test-LocalPort -Port 3001) {
  Write-Host 'El backend ya estaba iniciado.' -ForegroundColor Yellow
}
else {
  Write-Host 'Iniciando backend...'
  $backendProcess = Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/k', 'title Presupuestador Backend && npm.cmd run start:dev' `
    -WorkingDirectory $backendPath `
    -WindowStyle Minimized `
    -PassThru
  $state.backendPid = $backendProcess.Id
}

if (Test-LocalPort -Port 3000) {
  Write-Host 'El frontend ya estaba iniciado.' -ForegroundColor Yellow
}
else {
  Write-Host 'Iniciando frontend...'
  $frontendProcess = Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/k', 'title Presupuestador Frontend && npm.cmd run dev' `
    -WorkingDirectory $frontendPath `
    -WindowStyle Minimized `
    -PassThru
  $state.frontendPid = $frontendProcess.Id
}

$state | ConvertTo-Json | Set-Content -Path $statePath -Encoding UTF8

Wait-LocalPort -Port 3001 -ServiceName 'Backend'
Wait-LocalPort -Port 3000 -ServiceName 'Frontend'

if (-not $NoBrowser) {
  Start-Process 'http://localhost:3000'
}

Write-Host 'Presupuestador listo en http://localhost:3000' -ForegroundColor Cyan
