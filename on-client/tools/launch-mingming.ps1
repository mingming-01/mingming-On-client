[CmdletBinding()]
param(
  [ValidateRange(1024, 65535)][int]$Port = 5189,
  [switch]$Demo,
  [string]$SdpHostConfig,
  [string]$NativeHostConfig,
  [ValidateRange(1, 120)][int]$WaitSeconds = 30
)

Set-StrictMode -Version 3
$ErrorActionPreference = 'Stop'

if ($Demo -and ($PSBoundParameters.ContainsKey('SdpHostConfig') -or $PSBoundParameters.ContainsKey('NativeHostConfig'))) {
  Write-Host '시연 모드에는 실제 연결 설정을 함께 사용할 수 없습니다. 설정 없이 예제 모드로 실행하세요.' -ForegroundColor Yellow
  Read-Host 'Enter를 눌러 닫으세요'
  exit 2
}

$starter = Join-Path $PSScriptRoot 'start-alekov.ps1'
if (-not (Test-Path -LiteralPath $starter -PathType Leaf)) {
  Write-Host '앱 실행 도구를 찾을 수 없습니다.' -ForegroundColor Yellow
  Read-Host 'Enter를 눌러 닫으세요'
  exit 1
}

# 서버는 별도 PowerShell 창에서 실행하므로 사용자가 그 창에서 Ctrl+C로 종료할 수 있다.
$arguments = '-NoProfile -ExecutionPolicy Bypass -File "' + $starter + '" -Port ' + $Port
if ($Demo) { $arguments += ' -Demo' }
if (-not [string]::IsNullOrWhiteSpace($SdpHostConfig)) {
  $arguments += ' -SdpHostConfig "' + $SdpHostConfig + '"'
}
if (-not [string]::IsNullOrWhiteSpace($NativeHostConfig)) {
  $arguments += ' -NativeHostConfig "' + $NativeHostConfig + '"'
}

$powerShell = Join-Path $PSHOME 'powershell.exe'
$server = Start-Process -FilePath $powerShell -ArgumentList $arguments -PassThru
$url = 'http://127.0.0.1:' + $Port + '/'
$deadline = (Get-Date).AddSeconds($WaitSeconds)
$ready = $false

while ((Get-Date) -lt $deadline -and -not $ready) {
  if ($server.HasExited) {
    Write-Host '서버 실행 도구가 종료되었습니다. 별도 PowerShell 창의 오류를 확인하세요.' -ForegroundColor Yellow
    Read-Host 'Enter를 눌러 닫으세요'
    exit 1
  }
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2
    if ($response.StatusCode -eq 200) { $ready = $true }
  } catch {
    Start-Sleep -Milliseconds 300
  }
}

if (-not $ready) {
  Write-Host ('앱이 ' + $WaitSeconds + '초 안에 응답하지 않았습니다. 서버 창의 전체 메시지를 확인하세요.') -ForegroundColor Yellow
  Read-Host 'Enter를 눌러 닫으세요'
  exit 1
}

Start-Process $url
if ($Demo) { Write-Host '시연 모드입니다. 화면의 기록과 판정은 설명용 예제이며 실제 운영 데이터가 아닙니다.' -ForegroundColor Cyan }
Write-Host '브라우저를 열었습니다. 앱 서버는 별도 PowerShell 창에서 실행 중입니다.'
Write-Host '앱을 종료하려면 앱 서버 PowerShell 창에서 Ctrl+C를 누르세요.'
exit 0
