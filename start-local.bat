@echo off
rem Double-click to preview the Brightyard sites on this computer. Needs Node.js (https://nodejs.org, LTS).
rem brightyard.in opens at http://localhost:4321. Product sites: start-local.bat allocivo (port 4322)
rem or start-local.bat xessly (port 4323). It downloads the latest changes from GitHub while it runs.
rem Forms and the API do not work in this preview.
title Brightyard local preview
set SITE=%1
if "%SITE%"=="" set SITE=main
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0web\tools\local.ps1" -Site %SITE%
