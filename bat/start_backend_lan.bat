@echo off
setlocal

REM Move to repository root (folder that contains this .bat in \bat\)
cd /d "%~dp0.."

echo [1/2] Pulling latest changes...
git pull
if errorlevel 1 (
  echo.
  echo Git pull failed. Resolve conflicts/errors, then try again.
  pause
  exit /b 1
)

echo.
echo [2/2] Starting Django server on local network...
echo Access from other devices: http://YOUR_LOCAL_IP:8000/
echo.

cd backend
python manage.py runserver 0.0.0.0:8000

endlocal
