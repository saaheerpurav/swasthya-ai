@echo off
cd /d "%~dp0"
echo Checking for devices...
flutter devices
echo.
echo Running app...
flutter run --dart-define=API_BASE_URL=https://iv6gmj05bf.execute-api.ap-south-1.amazonaws.com/v1
pause
