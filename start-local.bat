@echo off
rem Double-click to run the BrightYard site locally at http://localhost:8080
rem Optional: pass a different port, for example: start-local.bat 8081
title BrightYard local preview
set PORT=%1
if "%PORT%"=="" set PORT=8080
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port %PORT%
