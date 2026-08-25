@echo off
cd /d "%~dp0"

echo Starting the dev server...
start "auto-market-map (dev server - do not click inside this window)" cmd /k npm run dev -- -p 3002

echo Waiting for the server to become ready...
:wait
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri http://localhost:3002 -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  timeout /t 2 /nobreak >nul
  goto wait
)

start "" http://localhost:3002
