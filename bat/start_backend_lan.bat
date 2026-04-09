@echo off
setlocal

set "START_LOG=%~dp0start_log.txt"
> "%START_LOG%" (
  echo ===== start_backend_lan.bat run started %DATE% %TIME% =====
)

REM Move to repository root (folder that contains this .bat in \bat\)
cd /d "%~dp0.." >> "%START_LOG%" 2>&1
set "REPO_ROOT=%CD%"

set "PYTHON_EXE=python"
if exist "%REPO_ROOT%\.venv\Scripts\python.exe" (
  set "PYTHON_EXE=%REPO_ROOT%\.venv\Scripts\python.exe"
)

for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$ErrorActionPreference='SilentlyContinue'; $ip = Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' -and $_.PrefixOrigin -ne 'WellKnown' } ^| Sort-Object -Property SkipAsSource,InterfaceMetric ^| Select-Object -ExpandProperty IPAddress -First 1; if (-not $ip) { $ip = Get-CimInstance Win32_NetworkAdapterConfiguration ^| Where-Object { $_.IPEnabled } ^| ForEach-Object { $_.IPAddress } ^| Where-Object { $_ -match '^(?:\d{1,3}\.){3}\d{1,3}$' -and $_ -ne '127.0.0.1' -and $_ -notlike '169.254.*' } ^| Select-Object -First 1 }; if ($ip) { $ip }"`) do (
  if not defined LOCAL_IP set "LOCAL_IP=%%I"
)
if not defined LOCAL_IP (
  set "LOCAL_IP=127.0.0.1"
  set "LOCAL_IP_FOUND=0"
) else (
  set "LOCAL_IP_FOUND=1"
)

echo [1/3] Pulling latest changes...
echo [1/3] Pulling latest changes...>> "%START_LOG%"
git pull >> "%START_LOG%" 2>&1
if errorlevel 1 (
  echo.
  echo Git pull failed. Resolve conflicts/errors, then try again.
  >> "%START_LOG%" echo Git pull failed. Resolve conflicts/errors, then try again.
  pause
  exit /b 1
)

echo.
echo [2/3] Applying Django migrations...
echo [2/3] Applying Django migrations...>> "%START_LOG%"
cd backend >> "%START_LOG%" 2>&1
"%PYTHON_EXE%" manage.py migrate >> "%START_LOG%" 2>&1
if errorlevel 1 (
  echo.
  echo Django migrate failed. Check migration errors in bat\start_log.txt.
  >> "%START_LOG%" echo Django migrate failed. Check migration errors in bat\start_log.txt.
  pause
  exit /b 1
)

echo.
echo [3/3] Starting Django server on local network...
if "%LOCAL_IP_FOUND%"=="1" (
  echo Access from other devices: http://%LOCAL_IP%:8000/
) else (
  echo WARNING: Unable to auto-detect LAN IPv4 address.
  echo Server will still run; use your PC IPv4 manually ^(for example from ipconfig^) to access from other devices.
  echo Local access: http://127.0.0.1:8000/
)
echo.>> "%START_LOG%"
echo [3/3] Starting Django server on local network...>> "%START_LOG%"
if "%LOCAL_IP_FOUND%"=="1" (
  echo Access from other devices: http://%LOCAL_IP%:8000/>> "%START_LOG%"
) else (
  echo WARNING: Unable to auto-detect LAN IPv4 address.>> "%START_LOG%"
  echo Use your PC IPv4 manually ^(from ipconfig^) for LAN access.>> "%START_LOG%"
  echo Local access: http://127.0.0.1:8000/>> "%START_LOG%"
)

if not exist "%REPO_ROOT%\.venv\Scripts\python.exe" (
  echo.
  echo WARNING: .venv not found. Using system Python; dependencies may be missing.
  echo Run bat\setup_venv.bat once if you see ModuleNotFoundError errors.
  echo.>> "%START_LOG%"
  echo WARNING: .venv not found. Using system Python; dependencies may be missing.>> "%START_LOG%"
)

"%PYTHON_EXE%" manage.py runserver 0.0.0.0:8000 >> "%START_LOG%" 2>&1

endlocal
