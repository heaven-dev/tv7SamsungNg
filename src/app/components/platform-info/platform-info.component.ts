import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { AppService } from '../../services/app.service';
import { LocaleService } from '../../services/locale.service';
import {
  tvMainPage,
  archiveMainPage,
  guidePage,
  searchPage,
  favoritesPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  platformInfoIconContainer,
  platformInfoKey,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC
} from '../../helpers/constants';

@Component({
  selector: 'app-platform-info',
  templateUrl: './platform-info.component.html',
  styleUrls: ['./platform-info.component.css']
})
export class PlatformInfoComponent implements OnInit, AfterViewInit {

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private commonService: CommonService,
    private appService: AppService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(platformInfoIconContainer);

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });
  }

  ngAfterViewInit(): void {
    let platformInfo: any = this.commonService.getValueFromCache(platformInfoKey);
    if (platformInfo) {
      platformInfo = this.commonService.stringToJson(platformInfo);

      let elem = this.commonService.getElementById('appName');
      if (elem) {
        const appName = this.localeService.getAppName();
        if (appName && appName.length > 0) {
          elem.innerHTML = appName;
        }
      }

      elem = this.commonService.getElementById('appVersion');
      if (elem) {
        const appVersion = this.localeService.getAppVersion();
        if (appVersion && appVersion.length > 0) {
          elem.innerHTML = appVersion;
        }
      }

      elem = this.commonService.getElementById('platformName');
      if (elem) {
        elem.innerHTML = platformInfo.platformName;
      }

      elem = this.commonService.getElementById('platformVersion');
      if (elem) {
        elem.innerHTML = platformInfo.platformVersion;
      }

      elem = this.commonService.getElementById('platformBuildTime');
      if (elem) {
        elem.innerHTML = platformInfo.platformBuildTime;
      }

      elem = this.commonService.getElementById('tvModel');
      if (elem) {
        elem.innerHTML = platformInfo.tvModel;
      }
    }

    setTimeout(() => {
      this.commonService.focusToElement('platformInfoContentContainer');
    });
  }

  removeKeydownEventListener(): void {
    if (this.keydownListener) {
      this.keydownListener();
      this.keydownListener = null;
    }
  }

  keyDownEventListener(e: any): void {
    const keyCode = e.keyCode;
    const contentId = e.target.id;

    //console.log('Key code : ', keyCode, ' Target element: ', contentId);

    e.preventDefault();

    if (keyCode === LEFT) {
      // LEFT arrow
      if (contentId === 'platformInfoContentContainer') {
        this.commonService.focusToElement(platformInfoIconContainer);
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow			
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusToElement('platformInfoContentContainer');
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusUp(contentId);
      }
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusDown(contentId);
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
        || contentId === searchIconContainer || contentId === favoritesIconContainer) {
        this.commonService.showElementById('platformInfoBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (this.commonService.isSideBarMenuActive(contentId)) {
        if (contentId === platformInfoIconContainer) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement('platformInfoContentContainer');
        }
        else if (contentId === tvIconContainer) {
          this.commonService.sideMenuSelection(tvMainPage);
        }
        else if (contentId === archiveIconContainer) {
          this.commonService.sideMenuSelection(archiveMainPage);
        }
        else if (contentId === guideIconContainer) {
          this.commonService.sideMenuSelection(guidePage);
        }
        else if (contentId === searchIconContainer) {
          this.commonService.sideMenuSelection(searchPage);
        }
        else if (contentId === favoritesIconContainer) {
          this.commonService.sideMenuSelection(favoritesPage);
        }
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        this.commonService.focusToElement('platformInfoContentContainer');
      }
      else {
        //this.commonService.showElementById('platformInfoBusyLoader');
        this.commonService.toPage(archiveMainPage, null);
      }
    }
  }
}
