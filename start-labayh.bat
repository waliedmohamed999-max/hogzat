@echo off
cd /d "%~dp0frontend"
npm run build && npm run start
