@echo off
cd /d "%~dp0apps\web"
set NODE_OPTIONS=--max-old-space-size=4096
..\..\node_modules\.bin\next dev --turbo
