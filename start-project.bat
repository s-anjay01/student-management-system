@echo off
echo ========================================================
echo   Starting EduManage - Student Management System
echo ========================================================
echo.

echo Starting Backend Server on port 3001...
start "EduManage Backend (Port 3001)" cmd /k "cd /d %~dp0server && npm start"

echo Starting Frontend Vite App on port 5173...
start "EduManage Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Both servers have been launched!
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this launcher window...
pause >nul
