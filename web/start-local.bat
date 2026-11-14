@echo off
rem Double-click to preview the NEW site (the Astro version in this folder) on this computer.
rem Needs Node.js 22.23.4 or newer, installed once from https://nodejs.org (the LTS installer).
rem brightyard.in opens at http://localhost:4321. For a product site: start-local.bat allocivo (port 4322)
rem or start-local.bat xessly (port 4323). Forms and the API do not work in this preview.
title Brightyard local preview (new site)
cd /d "%~dp0"
where node >/dev/null 2>/dev/null || (echo Node.js is not installed. Get it from https://nodejs.org, then run this again. & pause & exit /b 1)
if not exist node_modules (echo First run: installing, this takes a minute... & call npm install || (pause & exit /b 1))
set SITE=%1
if "%SITE%"=="" set SITE=main
echo Starting %SITE%. Leave this window open; close it to stop the preview.
node tools\dev.mjs %SITE%
pause
