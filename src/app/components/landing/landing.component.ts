import { Component, OnInit, AfterViewInit } from '@angular/core';

import { LocaleService } from '../../services/locale.service';

import { CommonService } from '../../services/common.service';
import { ProgramScheduleService } from '../../services/program-schedule.service';
import {
  programScheduleDataKey,
  tvMainPage,
  platformInfoKey,
  platformVersionKey,
  runOnBrowser
} from '../../helpers/constants';

import { systeminfo, tvinputdevice } from 'tizen-common-web';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  providers: [CommonService, ProgramScheduleService]
})
export class LandingComponent implements OnInit, AfterViewInit {

  loadLogo: string = '';

  constructor(
    private commonService: CommonService,
    private localeService: LocaleService,
    private programScheduleService: ProgramScheduleService
  ) { }

  ngOnInit(): void {
    this.loadLogo = this.localeService.getChannelLogo();
  }

  ngAfterViewInit(): void {
    // check network connection
    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.showElementById('noNetworkConnection');
      return;
    }

    // read platform info
    this.readPlatformInfo();

    // register remote control keys
    this.registerRemoteControlKeys();

    // get today and tomorrow guide
    this.programScheduleService.getGuideByDate(this.commonService.getTodayDate(), (gd) => {
      let guide = gd.data;

      this.programScheduleService.getGuideByDate(this.commonService.getTomorrowDate(), (gd) => {
        guide = guide.concat(gd.data);

        //console.log('Guide data: ', guide);

        this.commonService.cacheValue(programScheduleDataKey, this.commonService.jsonToString(guide));

        this.openTvMainPage();
      });
    });
  }

  openTvMainPage() {
    this.commonService.toPage(tvMainPage, null);
  }

  readPlatformInfo(): void {
    if (!runOnBrowser) {
      const { getCapability } = systeminfo;

      const platformVersion = getCapability('http://tizen.org/feature/platform.version');
      const platformName = getCapability('http://tizen.org/feature/platform.version.name');
      const platformBuildTime = getCapability('http://tizen.org/system/build.date');
      const tvModel = getCapability('http://tizen.org/system/model_name');

      if (platformVersion) {
        const json = {
          'platformVersion': platformVersion,
          'platformName': platformName,
          'platformBuildTime': platformBuildTime,
          'tvModel': tvModel
        }

        this.commonService.cacheValue(platformInfoKey, this.commonService.jsonToString(json));

        const split = platformVersion.split('.');

        if (split && this.isDigit(split[0]) && this.isDigit(split[1])) {
          // Version of platform format; '2.0' or '3.0' ...
          const value = parseInt(split[0]) + '.' + parseInt(split[1]);
          this.commonService.cacheValue(platformVersionKey, value);
        }
      }
    }
  }

  registerRemoteControlKeys(): void {
    if (!runOnBrowser) {
      const keys = [
        'MediaPlayPause',
        'MediaPlay',
        'MediaPause',
        'MediaRewind',
        'MediaFastForward',
        'MediaStop',
        'Info'
      ];

      const { registerKey } = tvinputdevice;

      for (let i = 0; i < keys.length; i++) {
        registerKey(keys[i]);
      }
    }
  }

  isDigit(value): boolean {
    return value && /^\d+$/.test(value);
  }
}
