@echo off
REM Cresca Basket DeFi - Windows Setup Script

echo === Cresca Basket DeFi Setup (Windows) ===
echo.

REM Create directory structure
echo Creating directory structure...
if not exist sources mkdir sources
if not exist scripts mkdir scripts
if not exist tests mkdir tests
if not exist backend mkdir backend
if not exist backend\src mkdir backend\src
if not exist mobile mkdir mobile

echo ✓ Directories created
echo.

REM Create .gitkeep files to track empty directories
echo. > scripts\.gitkeep
echo. > tests\.gitkeep

echo ✓ Directory structure ready
echo.
echo === IMPORTANT: Next Steps ===
echo.
echo Please manually create the Move source files in the sources\ directory:
echo.
echo 1. Copy code from SETUP_GUIDE.md into these files:
echo    - sources\basket_vault.move
echo    - sources\price_oracle.move
echo    - sources\leverage_engine.move
echo.
echo 2. Then run:
echo    movement move compile
echo.
echo 3. Initialize git:
echo    git init
echo    git add .
echo    git commit -m "Initialize Move project structure"
echo.
echo See SETUP_GUIDE.md for complete instructions.
echo.

pause
