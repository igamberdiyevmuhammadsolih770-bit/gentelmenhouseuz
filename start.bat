@echo off
title Gentleman House
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

REM ---- Telegram bot tokeni admin panel -> Sozlamalar orqali kiritiladi ----
REM set BOT_TOKEN=

REM ---- Google Drive (400GB) ga ulash ----
REM Google Drive for desktop o'rnatilgan bo'lsa, pastdagi qatordan "REM" ni olib tashlang:
REM set DATA_DIR=G:\My Drive\GentlemanHouse-data

start "" http://localhost:3000
node server.js
echo.
echo Server to'xtadi. Oynani yopish uchun biror tugmani bosing.
pause >nul
exit /b

:nonode
echo.
echo  [!] Node.js o'rnatilmagan.
echo      https://nodejs.org saytidan LTS versiyasini yuklab o'rnating,
echo      keyin start.bat ni qayta oching.
echo.
start https://nodejs.org
pause
