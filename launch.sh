#/bin/sh

###################################################################
# Shell script to build and run application on emulator or TV. 
#   - script assumes the tizen sdk folders are: '~/tizen-studio/' and '~/tizen-studio-data/'
#   - if pasword is asked when running the script it is 1234 
#   - creates a new certificate and security profile if security profile with ${PROFILE_NAME} not found
#   - edits and copies temporary profiles.xml file to ${PROFILE_DIR} folder (because bug in Tizen SDK)
#   - builds and packages app
#   - installs and run app on emulator or TV
#   - restores original profiles.xml file
#   - emulator have to be running if target device is emulator
#   - computer have to be connected to TV if target device is TV
#     - change value of TV model in line 22 if needed 
###################################################################

EMULATOR6='T-samsung-6.0-x86'
EMULATOR4='T-samsung-4.0-x86'
EMULATOR3='t-0123-1-emulator-312'
TV='UE43RU7475UXXC'

PATH=$PATH:~/tizen-studio/tools/ide/bin:~/tizen-studio/tools
TIZEN_EXE=tizen
PROFILE_DIR=~/tizen-studio-data/profile
AUTHOR_KEYSTORE_DIR=~/tizen-studio-data/keystore/author
PROFILE_NAME='MyTv7SamsungNgSecurityProfile'
SEC_PROFILE_OUT_FILE=./security/sec_prof.txt
TEMP_PROFILE_FILE=./security/profiles.xml.temp
FINAL_PROFILE_FILE=./security/profile.xml
CERT_PW='1234'
DEVICE_NAME=${EMULATOR6}
APP_ID=''
BUILT_APP_NAME=''
EXCLUDE_FROM_BUILD='.project .tproject'

# possible values of LANG: 'fi', 'et', 'ru' or 'sv'
LANG='fi'

if [ "$#" -ne 2 ]; then
  echo 'Usage: ./run.sh <fi|et|ru|sv> <e6|e4|e3|tv>'
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

if [ $2 == 'e4' ]
then
    DEVICE_NAME=${EMULATOR4}
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

# build app
npm run build-${LANG}

${TIZEN_EXE} security-profiles list -n ${PROFILE_NAME} > ${SEC_PROFILE_OUT_FILE}

SEARCH_STR="There is no '${PROFILE_NAME}' profile in security profiles."

if grep -q ${SEARCH_STR} ${SEC_PROFILE_OUT_FILE}; then
    echo '**************************************************'
    echo '***        Security profile not found!         ***'
    echo '*** Creating certificate and security profile! ***'
    echo '**************************************************'

    ${TIZEN_EXE} certificate -a MyTizen -p ${CERT_PW} -c FI -s TizenCity -ct TizenCity -o Tizen -n user -e mySecurityProfile@mySecurityProfile.org -f tv7SamsungNgUserCert
    ${TIZEN_EXE} security-profiles add -n ${PROFILE_NAME} -a ${AUTHOR_KEYSTORE_DIR}/tv7SamsungNgUserCert.p12 -p ${CERT_PW}
fi

rm ${SEC_PROFILE_OUT_FILE}

# copy edited profile.xml file to profiles directory
rm ${FINAL_PROFILE_FILE}
cp ${TEMP_PROFILE_FILE} ${FINAL_PROFILE_FILE}
sed -i 's|_HOME_DIR_|'$(eval echo ~$user)'|g' ${FINAL_PROFILE_FILE}

rm ${PROFILE_DIR}/profiles.xml.orig
mv ${PROFILE_DIR}/profiles.xml ${PROFILE_DIR}/profiles.xml.orig
cp ${FINAL_PROFILE_FILE} ${PROFILE_DIR}/profiles.xml
rm ${FINAL_PROFILE_FILE}

# build and package app
${TIZEN_EXE} build-web -e ${EXCLUDE_FROM_BUILD} -- ./tizen/dist/${LANG} -out dist/build
${TIZEN_EXE} package -t wgt -s ${PROFILE_NAME} -- tizen/dist/${LANG}/dist/build -o tizen/dist/${LANG}/dist/app

#rm -rf tizen/dist/${LANG}/build

# uninstall app from device
#${TIZEN_EXE} uninstall -p ${APP_ID} -t ${DEVICE_NAME}

# install and run app
${TIZEN_EXE} install -- tizen/dist/${LANG}/dist/app -n ${BUILT_APP_NAME} -t ${DEVICE_NAME}
${TIZEN_EXE} run -p ${APP_ID} -t ${DEVICE_NAME}

# restore original ~/tizen-studio-data/profile/profiles.xml file
rm ${PROFILE_DIR}/profiles.xml
mv ${PROFILE_DIR}/profiles.xml.orig ${PROFILE_DIR}/profiles.xml
