@echo off
setlocal

REM Move to repository root (folder that contains this .bat in \bat\)
cd /d "%~dp0.."

set "VENV_DIR=.venv"
set "REQ_FILE=requirements.txt"

if not exist "%REQ_FILE%" (
  echo ERROR: %REQ_FILE% not found in repository root.
  pause
  exit /b 1
)

echo [1/4] Ensuring virtual environment exists at %VENV_DIR%...
if not exist "%VENV_DIR%\Scripts\python.exe" (
  python -m venv "%VENV_DIR%"
  if errorlevel 1 (
    echo.
    echo Failed to create virtual environment.
    pause
    exit /b 1
  )
)

echo.
echo [2/4] Upgrading pip in virtual environment...
"%VENV_DIR%\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 (
  echo.
  echo Failed to upgrade pip.
  pause
  exit /b 1
)

echo.
echo [3/4] Installing/updating dependencies from %REQ_FILE%...
"%VENV_DIR%\Scripts\python.exe" -m pip install -r "%REQ_FILE%"
if errorlevel 1 (
  echo.
  echo Dependency installation failed.
  pause
  exit /b 1
)

echo.
echo [4/4] Done.
echo Virtual environment is ready: %VENV_DIR%
echo Activate with: %VENV_DIR%\Scripts\activate

endlocal
