@echo off
REM Safe cleanup wrapper for Windows.
REM Run from the project root.

echo.
echo Cleaning generated logs and caches...
echo.

node scripts\clean.js %*

echo.
echo Cleanup complete.
echo.
pause
