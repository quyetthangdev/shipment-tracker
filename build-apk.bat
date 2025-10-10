@echo off
echo ========================================
echo    Shipment Tracker - APK Builder
echo ========================================
echo.

echo [1/3] Building web app...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)
echo Web build completed!
echo.

echo [2/3] Syncing with Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo Sync completed!
echo.

echo [3/3] Building APK...
cd android
call .\gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: APK build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo    BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.

REM Copy APK to Desktop
set "APK_SOURCE=android\app\build\outputs\apk\debug\app-debug.apk"
set "APK_DEST=%USERPROFILE%\Desktop\shipment-tracker-%date:~-4,4%%date:~-10,2%%date:~-7,2%.apk"

if exist "%APK_SOURCE%" (
    copy "%APK_SOURCE%" "%APK_DEST%" >nul
    echo APK also copied to Desktop:
    echo %APK_DEST%
    echo.
)

echo Install to device: adb install -r "%APK_SOURCE%"
echo.
pause

