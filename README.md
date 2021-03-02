# tv7SamsungNg

This Samsung smart TV app is implemented using __Angular 11__. Project was generated with the [Angular CLI](https://cli.angular.io/) version __11.2.1__. Application is tested with the following devices:
  - Samsung smart TV (API version 5.0)
  - Samsung TV emulator (API version 3.2)
  - Samsung TV emulator (API version 6.0)

## App on other TV platforms
  - [LG](https://github.com/heaven-dev/tv7LgSpa)
  - Android:
    - [fi](https://github.com/heaven-dev/taivasTv7Android)
    - [et](https://github.com/heaven-dev/taevasTv7Android)
    - [ru](https://github.com/heaven-dev/nebesaTv7Android)
    - [sv](https://github.com/heaven-dev/himlenTv7Android)

## Demo

App running on Samsung TV emulator (API version 6.0).

![Demo](https://github.com/heaven-dev/demo/blob/main/demo/demo.gif)

## Overview

__TV7__ web sites:
  - [Taivas TV7](https://www.tv7.fi/)
  - [Taevas TV7](https://www.tv7.ee/)
  - [Himlen TV7](https://www.himlentv7.se/)
  - [Небеса ТВ7](https://www.nebesatv7.com/)

Application make possible to watch TV channel and videos from the video archive. The application supports the following locales:
  - __fi__: Finnish
  - __et__: Estonian
  - __sv__: Swedish
  - __ru__: Russian

Each locale is an independent application. You have to use __gulp__ to generate a localized version of the application. Instructions are below.

## Instructions

### Download and install git
  - If your computer OS is windows you can download the git from [here](https://git-scm.com/download/win).
  - If your computer OS is linux (Ubuntu) you can install git using package manager.

### Clone repository
Clone this repository to your computer disk.
  - __git clone https://github.com/heaven-dev/tv7SamsungNg.git__

### Download and install node (version 12.x.x)
  - If your computer OS is windows you can download node from [here](https://nodejs.org/en/download/).
  - If your computer OS is linux (Ubuntu) you can install node using package manager.

### Install dependencies
  - In the root folder of the project: __npm install__

### Install gulp-cli
  - __sudo npm install -g gulp-cli__
  - Gulp is used to build the application:
    - Build __finnish__: __npm run build-fi__
    - Build __estionian__: __npm run build-et__
    - Build __swedish__: __npm run build-sv__
    - Build __russian__: __npm run build-ru__
    - Build __all__: __npm run build-all__
  - Build is created under the __root folder__ of this project for example __tizen/dist/fi__ and respectively to each locale.
      
### Download and install Tizen studio
  - Download Tizen studio from [here](https://developer.tizen.org/development/tizen-studio/download).
    - Select your OS.
    - Download this package: __Tizen Studio 4.1 with IDE installer__.
    - Save the package to the disk and start the setup.
    - Follow the installation instructions from [here](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html).
    - When you see text __To install the extensions from local images:__ you have done.

### Import projects into the Tizen studio IDE
  - Start Tizen studio.
  - Select workspace folder and launch.
  - Select __File -> Import -> Tizen project__.
    - Select location for example (__projectRoot/tizen/dist/fi__). Similarly you can import each project to select folder of the locale for example __projectRoot/tizen/dist/et__, __projectRoot/tizen/dist/sv__ or __projectRoot/tizen/dist/ru__.
    - Select __Next__.
    - Select profile __samsung-tv__ and version __6.0__ and select __Next__.
  - Now you should see the project on IDE.
  - All __HTML__, __CSS__ and __javascript__ files are compressed by the build commands.

### Run application on emulator
  - Select __Run -> Run configurations__ from the menu.
  - Select Tizen web application and click __New launch configuration__.
  - Set name to launch configuration.
  - Select project if not already selected.
  - Select __Apply__ and __Close__.
  - You can run __release__ version:
    - Click the project name with right mouse button.
    - Select __Run As -> Run configurations__ and select launch configuration you create and click __Run__.
    - Emulator is started and application is opened into the emulator.
  - You can run __debug__ version:
    - Click the project name with right mouse button.
    - Select __Debug As -> Debug configurations__ and select launch configuration you create and click __Run__.
    - Debug mode opens also an inspector of the browser.
    - Emulator is started and application is opened into the emulator.

### Run application on TV
  - At first you have to switch TV to the developer mode.
  - Your computer and TV have to be in the same network (wi-fi is fine).
  - Follow instructions from [here](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html).
  - Be sure that your computer firewall doesn't block the connection between the computer and the TV.
  - Probably you have to a create certificate profile (__Tools -> Certificate Manager__) and a Samsung account to run the application on TV.

### Run application on a browser
  - Prepare app by editing this line: [locale.service.ts](https://github.com/heaven-dev/tv7SamsungNg/blob/main/src/app/services/locale.service.ts#L7)
    - Add one of the following locale (__fi__, __et__, __ru__ or __sv__) to the file.
    - You don't need to care about this file if you build the app with a build command for example __npm run build-fi__. In that case the gulp automatically edits the file.
    - Set [this](https://github.com/heaven-dev/tv7SamsungNg/blob/main/src/app/helpers/constants.ts#L1) flag to __true__.
  - Run command __ng serve__ in the project root.
  - Navigate to __http://localhost:4200__ and the app is starting.

### TV or emulator API version required to run this application 
  - __API version 3.0 TV or newer__ (release year of API version 3.0 TV is 2017)
    - Tizen TV [web engine](https://developer.samsung.com/smarttv/develop/specifications/web-engine-specifications.html)
    - Tizen TV [general specifications](https://developer.samsung.com/smarttv/develop/specifications/general-specifications.html)

### Useful links
  - [Tizen TV](https://developer.tizen.org/tizen/tv) developer web pages.
  - [Command Line Interface (CLI) Commands](https://developer.tizen.org/development/tizen-studio/web-tools/cli)
  - [Application Signing and Certificates](https://docs.tizen.org/application/web/tutorials/sign-certificate/)
  - [Tizen TV Web Device API Reference](https://docs.tizen.org/application/web/api/latest/device_api/tv/index.html)

### License
 - [MIT](https://github.com/heaven-dev/tv7SamsungNg/blob/master/LICENSE.md)
