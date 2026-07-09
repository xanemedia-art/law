@echo off
set "ZIPALIGN=C:\Users\94591\AppData\Local\Android\Sdk\build-tools\36.0.0\zipalign.exe"
set "APK_DIR=c:\Users\94591\OneDrive\Desktop\New folder (3)\legaltalk-india\android\app\build\outputs\apk\debug"
set "INPUT_APK=%APK_DIR%\app-debug.apk"
set "TEMP_APK=%APK_DIR%\app-debug-temp.apk"

echo Aligning APK with 16 KB page size...
"%ZIPALIGN%" -f -P 16 4 "%INPUT_APK%" "%TEMP_APK%"
if %ERRORLEVEL% equ 0 (
    echo Alignment successful. Replacing original APK...
    move /y "%TEMP_APK%" "%INPUT_APK%"
    echo Verification:
    "%ZIPALIGN%" -c -P 16 -v 4 "%INPUT_APK%"
) else (
    echo Alignment failed!
)
