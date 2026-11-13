@echo off
title GitHub push - Gentleman House
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 goto nogit

if not exist .git git init
git config user.name "Gentleman House"
git config user.email "igamberdiyevmuhammadsolih770-bit@users.noreply.github.com"
git add -A
git commit -m "Gentleman House: sayt, admin panel, botlar, AI, Vercel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01N3o1Spg9AcVAAgLvDfmLAi"
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin https://github.com/igamberdiyevmuhammadsolih770-bit/gentelmenhouseuz.git
git push -u origin main
if errorlevel 1 (
  echo.
  echo GitHubda boshqa fayllar bor - birlashtirib qayta urinilmoqda...
  git pull origin main --allow-unrelated-histories --no-edit
  git push -u origin main
)
echo.
echo ===== TAYYOR =====
pause
exit /b

:nogit
echo Git ornatilmagan. https://git-scm.com/download/win dan ornating va push.bat ni qayta oching.
start https://git-scm.com/download/win
pause
