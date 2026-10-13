param(
    [switch]$InstallOnly,
    [switch]$RunOnly
)

$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$backendDir = Join-Path $projectRoot 'backend'
$frontendDir = Join-Path $projectRoot 'my-app'
$venvDir = Join-Path $backendDir '.venv'
$pythonExe = Join-Path $venvDir 'Scripts\python.exe'

function Assert-PathExists {
    param(
        [string]$Path,
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label was not found at '$Path'. Run this script from the cloned project root."
    }
}

Assert-PathExists -Path $backendDir -Label 'Backend folder'
Assert-PathExists -Path $frontendDir -Label 'Frontend folder'

if (-not $RunOnly) {
    Write-Host 'Installing backend dependencies...'
    if (-not (Test-Path -LiteralPath $venvDir)) {
        python -m venv $venvDir
    }

    & $pythonExe -m pip install --upgrade pip
    & $pythonExe -m pip install -r (Join-Path $backendDir 'requirements.txt')

    Write-Host 'Installing frontend dependencies...'
    Push-Location $frontendDir
    try {
        npm install
    }
    finally {
        Pop-Location
    }
}

if ($InstallOnly) {
    Write-Host 'Dependencies installed.'
    return
}

Write-Host 'Starting backend and frontend dev servers...'

Start-Process -WindowStyle Normal -WorkingDirectory $backendDir -FilePath 'powershell.exe' -ArgumentList @(
    '-NoExit',
    '-Command',
    "& '$pythonExe' -m uvicorn main:app --reload"
)

Start-Process -WindowStyle Normal -WorkingDirectory $frontendDir -FilePath 'powershell.exe' -ArgumentList @(
    '-NoExit',
    '-Command',
    'npm run dev'
)

Write-Host 'Backend is running with uvicorn and frontend is running with Vite.'