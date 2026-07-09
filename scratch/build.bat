@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "c:\Users\94591\OneDrive\Desktop\New folder (3)\legaltalk-india\android"
call gradlew.bat assembleDebug
