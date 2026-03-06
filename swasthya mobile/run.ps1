# Run SwasthyaAI app (PowerShell)
# Usage: .\run.ps1                    (default: Android)
#        .\run.ps1 -Chrome            (run in Chrome)
#        .\run.ps1 -WebServer         (run web server, open URL in browser)
#        .\run.ps1 -Chrome -SkipPub   (skip pub get if it hangs)
#        .\run.ps1 -OpenAiKey "sk-..."

param(
    [string]$OpenAiKey = "",
    [string]$ApiBase = "https://iv6gmj05bf.execute-api.ap-south-1.amazonaws.com/v1",
    [switch]$Chrome,
    [switch]$WebServer,
    [switch]$SkipPub
)

Set-Location $PSScriptRoot

if (-not $SkipPub) {
    Write-Host "Resolving dependencies..."
    flutter pub get
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$dartDefines = @("API_BASE_URL=$ApiBase")
if ($OpenAiKey) { $dartDefines += "OPENAI_API_KEY=$OpenAiKey" }
$defineArgs = $dartDefines | ForEach-Object { "--dart-define=$_" }

if ($WebServer) {
    Write-Host "Starting web server - open the URL below in Chrome..."
    flutter run -d web-server @defineArgs
} elseif ($Chrome) {
    $dartDefines = @("API_BASE_URL=$ApiBase")
    if ($OpenAiKey) { $dartDefines += "OPENAI_API_KEY=$OpenAiKey" }
    $defineArgs = $dartDefines | ForEach-Object { "--dart-define=$_" }
    Write-Host "Running on Chrome (first build may take 1-2 min)..."
    flutter run -d chrome @defineArgs
} else {
    Write-Host "Checking for devices..."
    flutter devices
    Write-Host "`nRunning app..."
    flutter run @defineArgs
}
