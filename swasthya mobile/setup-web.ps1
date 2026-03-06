# Run each command one at a time (no pasting two commands together)
Set-Location $PSScriptRoot

Write-Host "1. Enabling web..."
flutter config --enable-web

Write-Host "`n2. Listing devices (should show Chrome)..."
flutter devices

Write-Host "`n3. Run the app with: .\run.ps1 -WebServer -SkipPub"
Write-Host "   Then open the URL it prints in Chrome.`n"
