rem build and launch fi locale app to TV emulator 6.0

set TIZEN_EXE=C:\tizen-studio\tools\ide\bin\tizen.bat
set EMULATOR6=T-samsung-6.0-x86
set DEVICE_NAME=%EMULATOR6%
set APP_ID=
set BUILT_APP_NAME=
set EXCLUDE_FROM_BUILD=.project .tproject tizen
set WORKING_DIR=%cd%

set LANG=fi
set APP_ID=M8S1y7Jdfp.TaivasTV7
set BUILT_APP_NAME=TaivasTV7.wgt

npm run build-fi

CALL %TIZEN_EXE% build-web -e %EXCLUDE_FROM_BUILD% -- %WORKING_DIR%/tizen/dist/%LANG% -out %WORKING_DIR%/tizen/dist/%LANG%/dist/build
CALL %TIZEN_EXE% package -t wgt -s MyProfile -- %WORKING_DIR%/tizen/dist/%LANG%/dist/build -o %WORKING_DIR%/tizen/dist/%LANG%/dist/app

CALL %TIZEN_EXE% install -- %WORKING_DIR%/tizen/dist/%LANG%/dist/app -n %BUILT_APP_NAME% -t %DEVICE_NAME%
CALL %TIZEN_EXE% run -p %APP_ID% -t %DEVICE_NAME%
