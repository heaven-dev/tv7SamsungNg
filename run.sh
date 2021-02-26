#/bin/sh

###################################################################
# Shell script to build and run application on TV.                #
###################################################################

TIZEN_EXE=~/tizen-studio/tools/ide/bin/tizen
PROFILE_DIR=~/tizen-studio-data/profile
EMULATOR6='T-samsung-6.0-x86'
EMULATOR3='t-0123-1-emulator-312'
TV='UE43RU7475UXXC'
DEVICE_NAME=${EMULATOR6}
APP_ID=''
BUILT_APP_NAME=''
EXCLUDE_FROM_BUILD='.project .tproject'

# possible values of LANG: 'fi', 'et', 'ru' or 'sv'
LANG='fi'

if [ "$#" -ne 2 ]; then
  echo 'Usage: ./run.sh <fi|et|ru|sv> <e6|e3|tv>'
  echo 'For example run fi locale on tizen 6 emulator: "./run.sh fi e6"'
  exit 1
fi

if [ $1 != '' ]
then
    LANG=$1
    echo 'Run lang: ' ${LANG}
fi

if [ ${LANG} == 'fi' ]
then
    APP_ID='M8S1y7Jdfp.TaivasTV7'
    BUILT_APP_NAME='TaivasTV7.wgt'
fi

if [ ${LANG} == 'et' ]
then
    APP_ID='PhfLvc3h22.TaevasTV7'
    BUILT_APP_NAME='TaevasTV7.wgt'
fi

if [ ${LANG} == 'ru' ]
then
    APP_ID='eA33rRRHbq.NebesaTV7'
    BUILT_APP_NAME='NebesaTV7.wgt'
fi

if [ ${LANG} == 'sv' ]
then
    APP_ID='b6QZbPO8Pr.HimlenTV7'
    BUILT_APP_NAME='HimlenTV7.wgt'
fi

DEVICE_NAME=${EMULATOR6}
if [ $2 == 'e6' ]
then
    DEVICE_NAME=${EMULATOR6}
fi

if [ $2 == 'e3' ]
then
    DEVICE_NAME=${EMULATOR3}
fi

if [ $2 == 'tv' ]
then
    DEVICE_NAME=${TV}
fi

echo 'APP_ID: ' ${APP_ID}
echo 'BUILT_APP_NAME: ' ${BUILT_APP_NAME}

npm run build-${LANG}

rm -rf ${PROFILE_DIR}/profiles.xml
cp ${PROFILE_DIR}/profiles.xml.bu ${PROFILE_DIR}/profiles.xml

${TIZEN_EXE} build-web -e ${EXCLUDE_FROM_BUILD} -- ./tizen/dist/${LANG} -out dist/build
${TIZEN_EXE} package -t wgt -s MyProfile -- tizen/dist/${LANG}/dist/build -o tizen/dist/${LANG}/dist/app

#rm -rf tizen/dist/${LANG}/build

#${TIZEN_EXE} uninstall -p ${APP_ID} -t ${DEVICE_NAME}
${TIZEN_EXE} install -- tizen/dist/${LANG}/dist/app -n ${BUILT_APP_NAME} -t ${DEVICE_NAME}
${TIZEN_EXE} run -p ${APP_ID} -t ${DEVICE_NAME}
