@echo off
cd /d "%~dp0"
echo Staging changes...
git add .
echo Committing...
git commit -m "feat: complete student management system with github workflows and templates"
echo Pushing to origin main...
git push -u origin main
echo Done!
pause
