@echo off
setlocal

set "START_LOG=%~dp0start_log.txt"
> "%START_LOG%" (
  echo ===== start_backend_lan.bat run started %DATE% %TIME% =====
)

REM Move to repository root (folder that contains this .bat in \bat\)
cd /d "%~dp0.." >> "%START_LOG%" 2>&1

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
echo Access from other devices: http://YOUR_LOCAL_IP:8000/
echo.>> "%START_LOG%"
echo [2/2] Starting Django server on local network...>> "%START_LOG%"
echo Access from other devices: http://YOUR_LOCAL_IP:8000/>> "%START_LOG%"

cd backend >> "%START_LOG%" 2>&1
python manage.py runserver 0.0.0.0:8000 >> "%START_LOG%" 2>&1

endlocal
