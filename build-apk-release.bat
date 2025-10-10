@echo off
echo ========================================
echo  Shipment Tracker - APK Release Builder
echo ========================================
echo.
echo WARNING: This will build a RELEASE APK
echo Make sure you have configured keystore!
echo.
pause

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

echo [3/3] Building Release APK...
cd android
call .\gradlew.bat assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: APK build failed!
    echo.
    echo Did you configure the keystore?
    echo See BUILD_APK.md for instructions.
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo    RELEASE BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\release\app-release.apk
echo.

REM Copy APK to Desktop
set "APK_SOURCE=android\app\build\outputs\apk\release\app-release.apk"
set "APK_DEST=%USERPROFILE%\Desktop\shipment-tracker-release-%date:~-4,4%%date:~-10,2%%date:~-7,2%.apk"

if exist "%APK_SOURCE%" (
    copy "%APK_SOURCE%" "%APK_DEST%" >nul
    echo APK also copied to Desktop:
    echo %APK_DEST%
    echo.
    
    REM Show file size
    for %%A in ("%APK_SOURCE%") do (
        set size=%%~zA
        set /a sizeMB=%%~zA/1024/1024
    )
    echo APK Size: !sizeMB! MB
    echo.
)

echo This is a SIGNED RELEASE APK - ready for distribution!
echo Install to device: adb install -r "%APK_SOURCE%"
echo.
pause

