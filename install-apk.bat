@echo off
echo ========================================
echo    Shipment Tracker - APK Installer
echo ========================================
echo.

REM Check if ADB is available
adb version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ADB not found!
    echo Please install Android SDK and add to PATH
    echo.
    pause
    exit /b 1
)

echo Checking connected devices...
adb devices
echo.

echo Available APK builds:
echo.
echo [1] Debug APK (for testing)
echo [2] Release APK (production)
echo [3] Browse for APK file
echo.
set /p choice="Select build type (1-3): "

if "%choice%"=="1" (
    set "APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk"
    set "APK_NAME=Debug APK"
) else if "%choice%"=="2" (
    set "APK_PATH=android\app\build\outputs\apk\release\app-release.apk"
    set "APK_NAME=Release APK"
) else if "%choice%"=="3" (
    set /p "APK_PATH=Enter APK file path: "
    set "APK_NAME=Custom APK"
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

if not exist "%APK_PATH%" (
    echo.
    echo ERROR: APK file not found!
    echo Path: %APK_PATH%
    echo.
    echo Please build the APK first:
    echo - For Debug: run build-apk.bat
    echo - For Release: run build-apk-release.bat
    echo.
    pause
    exit /b 1
)

echo.
echo Installing %APK_NAME%...
echo File: %APK_PATH%
echo.

adb install -r "%APK_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    INSTALLATION SUCCESSFUL!
    echo ========================================
    echo.
    echo The app has been installed on your device.
    echo App ID: com.shipment.tracker
    echo.
) else (
    echo.
    echo ========================================
    echo    INSTALLATION FAILED!
    echo ========================================
    echo.
    echo Common issues:
    echo - No device connected
    echo - USB debugging not enabled
    echo - Device not authorized
    echo.
    echo Try:
    echo 1. Check USB connection
    echo 2. Enable USB debugging in Developer Options
    echo 3. Authorize computer on device when prompted
    echo 4. Run: adb devices
    echo.
)

pause

