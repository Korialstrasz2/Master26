@echo off
setlocal

set "START_LOG=%~dp0start_log.txt"
> "%START_LOG%" (
  echo ===== start_backend_lan.bat run started %DATE% %TIME% =====
)

REM Move to repository root (folder that contains this .bat in \bat\)
cd /d "%~dp0.." >> "%START_LOG%" 2>&1

set "PYTHON_EXE=python"
if exist ".venv\Scripts\python.exe" (
  set "PYTHON_EXE=.venv\Scripts\python.exe"
)

for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "(Get-CimInstance Win32_NetworkAdapterConfiguration ^| Where-Object { $_.IPEnabled } ^| ForEach-Object { $_.IPAddress } ^| Where-Object { $_ -match '^[0-9]+\.' -and $_ -ne '127.0.0.1' -and $_ -notlike '169.254*' } ^| Select-Object -First 1)"`) do (
  if not defined LOCAL_IP set "LOCAL_IP=%%I"
)
if not defined LOCAL_IP set "LOCAL_IP=YOUR_LOCAL_IP"

echo [1/2] Pulling latest changes...
echo [1/2] Pulling latest changes...>> "%START_LOG%"
git pull >> "%START_LOG%" 2>&1
if errorlevel 1 (
  echo.
  echo Git pull failed. Resolve conflicts/errors, then try again.
  >> "%START_LOG%" echo Git pull failed. Resolve conflicts/errors, then try again.
  pause
  exit /b 1
)

echo.
echo [2/2] Starting Django server on local network...
echo Access from other devices: http://%LOCAL_IP%:8000/
echo.>> "%START_LOG%"
echo [2/2] Starting Django server on local network...>> "%START_LOG%"
echo Access from other devices: http://%LOCAL_IP%:8000/>> "%START_LOG%"

if not exist ".venv\Scripts\python.exe" (
  echo.
  echo WARNING: .venv not found. Using system Python; dependencies may be missing.
  echo Run bat\setup_venv.bat once if you see ModuleNotFoundError errors.
  echo.>> "%START_LOG%"
  echo WARNING: .venv not found. Using system Python; dependencies may be missing.>> "%START_LOG%"
)

cd backend >> "%START_LOG%" 2>&1
"%PYTHON_EXE%" manage.py runserver 0.0.0.0:8000 >> "%START_LOG%" 2>&1

endlocal
