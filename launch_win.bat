echo off
echo Usage example: 'launch_win.bat LANG DEVICE'
echo  - LANG: 'fi', 'et', 'ru' or 'sv'
echo  - DEVICE: 'e4', 'e6' or 'tv'
echo At first use the 'Certificate Manager' to create certificate profile which name is 'MyProfile'

set TIZEN_EXE=C:\tizen-studio\tools\ide\bin\tizen.bat
set EMULATOR4=T-samsung-4.0-x86
set EMULATOR6=T-samsung-6.0-x86
set TV=UE43RU7475UXXC
set DEVICE_NAME=%EMULATOR6%
set PROFILE_NAME=MyProfile
set EXCLUDE_FROM_BUILD=.project .tproject tizen/
set WORKING_DIR=%cd%

rem LANG can be: fi, et, ru or sv
set LANG=fi
set APP_ID=M8S1y7Jdfp.TaivasTV7
set BUILT_APP_NAME=TaivasTV7.wgt

IF %1 EQU fi (
    set LANG=fi
    set APP_ID=M8S1y7Jdfp.TaivasTV7
    set BUILT_APP_NAME=TaivasTV7.wgt
)

IF %1 EQU et (
    set LANG=et
    set APP_ID=PhfLvc3h22.TaevasTV7
    set BUILT_APP_NAME=TaevasTV7.wgt
)

IF %1 EQU ru (
    set LANG=ru
    set APP_ID=eA33rRRHbq.NebesaTV7
    set BUILT_APP_NAME=NebesaTV7.wgt
)

IF %1 EQU sv (
    set LANG=sv
    set APP_ID=b6QZbPO8Pr.HimlenTV7
    set BUILT_APP_NAME=HimlenTV7.wgt
)

echo LANG: %LANG%
echo APP_ID: %APP_ID%
echo BUILT_APP_NAME: %BUILT_APP_NAME%

IF %2 EQU e4 (
    set DEVICE_NAME=%EMULATOR4%
)

IF %2 EQU e6 (
    set DEVICE_NAME=%EMULATOR6%
)

IF %2 EQU tv (
    set DEVICE_NAME=%TV%
)

echo DEVICE: %DEVICE_NAME%

CALL npm run build-%LANG%

CALL %TIZEN_EXE% build-web -e %EXCLUDE_FROM_BUILD% -- %WORKING_DIR%/tizen/dist/%LANG% -out %WORKING_DIR%/tizen/dist/%LANG%/dist/build
CALL %TIZEN_EXE% package -t wgt -s %PROFILE_NAME% -- %WORKING_DIR%/tizen/dist/%LANG%/dist/build -o %WORKING_DIR%/tizen/dist/%LANG%/dist/app

rem CALL %TIZEN_EXE% uninstall -p %APP_ID% -t %DEVICE_NAME%
CALL %TIZEN_EXE% install -- %WORKING_DIR%/tizen/dist/%LANG%/dist/app -n %BUILT_APP_NAME% -t %DEVICE_NAME%
CALL %TIZEN_EXE% run -p %APP_ID% -t %DEVICE_NAME%
