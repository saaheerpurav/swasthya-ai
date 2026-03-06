# Build SwasthyaAI release APK with OpenAI key and API base URL.
# Usage: .\build-apk.ps1
#        .\build-apk.ps1 -OpenAiKey "sk-..."
#        .\build-apk.ps1 -OpenAiKey $env:OPENAI_API_KEY
#
# APK output: build\app\outputs\flutter-apk\app-release.apk
# Ensure you have enough free disk space before building.

param(
    [string]$OpenAiKey = "",
    [string]$ApiBase = "https://iv6gmj05bf.execute-api.ap-south-1.amazonaws.com/v1"
)

Set-Location $PSScriptRoot

Write-Host "Resolving dependencies..."
flutter pub get
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$dartDefines = @(
    "API_BASE_URL=$ApiBase"
)
if ($OpenAiKey) { $dartDefines += "OPENAI_API_KEY=$OpenAiKey" }
$defineArgs = $dartDefines | ForEach-Object { "--dart-define=$_" }

Write-Host "Building release APK (this may take a few minutes)..."
flutter build apk @defineArgs

if ($LASTEXITCODE -eq 0) {
    $apkPath = Join-Path $PSScriptRoot "build\app\outputs\flutter-apk\app-release.apk"
    Write-Host ""
    Write-Host "APK built successfully: $apkPath" -ForegroundColor Green
    Write-Host "Install on device: adb install $apkPath"
}

exit $LASTEXITCODE
