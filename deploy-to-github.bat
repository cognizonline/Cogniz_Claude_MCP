@echo off
echo ========================================
echo Cogniz MCP Server - GitHub Deployment
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the cogniz-mcp-server directory
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.
echo Files to deploy:
dir /B package.json tsconfig.json render.yaml src 2>nul
echo.

REM Initialize git if needed
if not exist ".git" (
    echo Initializing git repository...
    git init
    git branch -M main
) else (
    echo Git repository already initialized
)

REM Add files
echo.
echo Adding files to git...
git add .gitignore
git add package.json
git add package-lock.json
git add tsconfig.json
git add render.yaml
git add README.md
git add DEPLOYMENT.md
git add QUICK_DEPLOY.md
git add GITHUB_SETUP.md
git add TROUBLESHOOTING.md
git add src\index.ts
git add src\server-remote.ts

REM Show status
echo.
echo Git status:
git status

REM Commit
echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Deploy Cogniz Remote MCP Server

echo.
echo Committing with message: %commit_msg%
git commit -m "%commit_msg%"

REM Check if remote exists
git remote -v | findstr "origin" >nul
if errorlevel 1 (
    echo.
    echo GitHub repository URL is needed.
    echo Example: https://github.com/YOUR-USERNAME/cogniz-mcp-server.git
    echo.
    set /p repo_url="Enter GitHub repository URL: "
    git remote add origin !repo_url!
)

REM Push
echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Deployment complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to render.com
echo 2. Click "New +" - "Web Service"
echo 3. Connect your GitHub repository
echo 4. Add environment variable: COGNIZ_API_KEY
echo 5. Click "Create Web Service"
echo.
pause
