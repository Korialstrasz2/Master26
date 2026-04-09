@echo off
setlocal

set "SETUP_LOG=%~dp0setup_log.txt"
> "%SETUP_LOG%" (
  echo ===== setup_venv.bat run started %DATE% %TIME% =====
)

REM Move to repository root (folder that contains this .bat in \bat\)
cd /d "%~dp0.." >> "%SETUP_LOG%" 2>&1

set "VENV_DIR=.venv"
set "REQ_FILE=requirements.txt"

if not exist "%REQ_FILE%" (
  echo ERROR: %REQ_FILE% not found in repository root.
  >> "%SETUP_LOG%" echo ERROR: %REQ_FILE% not found in repository root.
  pause
  exit /b 1
)

echo [1/4] Ensuring virtual environment exists at %VENV_DIR%...
echo [1/4] Ensuring virtual environment exists at %VENV_DIR%...>> "%SETUP_LOG%"
if not exist "%VENV_DIR%\Scripts\python.exe" (
  python -m venv "%VENV_DIR%" >> "%SETUP_LOG%" 2>&1
  if errorlevel 1 (
    echo.
    echo Failed to create virtual environment.
    >> "%SETUP_LOG%" echo Failed to create virtual environment.
    pause
    exit /b 1
  )
)

echo.
echo [2/4] Upgrading pip in virtual environment...
echo [2/4] Upgrading pip in virtual environment...>> "%SETUP_LOG%"
"%VENV_DIR%\Scripts\python.exe" -m pip install --upgrade pip >> "%SETUP_LOG%" 2>&1
if errorlevel 1 (
  echo.
  echo Failed to upgrade pip.
  >> "%SETUP_LOG%" echo Failed to upgrade pip.
  pause
  exit /b 1
)

echo.
echo [3/4] Installing/updating dependencies from %REQ_FILE%...
echo [3/4] Installing/updating dependencies from %REQ_FILE%...>> "%SETUP_LOG%"
"%VENV_DIR%\Scripts\python.exe" -m pip install -r "%REQ_FILE%" >> "%SETUP_LOG%" 2>&1
if errorlevel 1 (
  echo.
  echo Dependency installation failed.
  >> "%SETUP_LOG%" echo Dependency installation failed.
  pause
  exit /b 1
)

echo.
echo [4/4] Done.
echo Virtual environment is ready: %VENV_DIR%
echo Activate with: %VENV_DIR%\Scripts\activate

echo.>> "%SETUP_LOG%"
echo [4/4] Done.>> "%SETUP_LOG%"
echo Virtual environment is ready: %VENV_DIR%>> "%SETUP_LOG%"
echo Activate with: %VENV_DIR%\Scripts\activate>> "%SETUP_LOG%"

endlocal
