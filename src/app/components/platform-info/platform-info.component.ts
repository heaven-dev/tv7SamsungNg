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
  channelInfoPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  channelInfoIconContainer,
  platformInfoIconContainer,
  clearIconContainer,
  platformInfoKey,
  videoStatusDataKey,
  favoritesDataKey,
  savedSearchDataKey,
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

  clearMenuItems: any = [];
  clearMenuVisible: boolean = false;
  clearMenuItemMaxCount: number = 12;
  selectedClearMenuId: string = null;

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
    this.setFontSizes(this.calculateTableFontSize());

    let platformInfo: any = this.commonService.getValueFromCache(platformInfoKey);
    if (platformInfo) {
      platformInfo = this.commonService.stringToJson(platformInfo);

      const appName = this.localeService.getAppName();
      if (appName && appName.length > 0) {
        this.commonService.addToElement('appName', appName);
      }

      const appVersion = this.localeService.getAppVersion();
      if (appVersion && appVersion.length > 0) {
        this.commonService.addToElement('appVersion', appVersion);
      }

      this.commonService.addToElement('platformName', platformInfo.platformName);
      this.commonService.addToElement('platformVersion', platformInfo.platformVersion);
      this.commonService.addToElement('platformBuildTime', platformInfo.platformBuildTime);
      this.commonService.addToElement('tvModel', platformInfo.tvModel);
    }

    this.localeService.setLocaleText('copyrightText');

    setTimeout(() => {
      this.commonService.focusToElement(clearIconContainer);
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

    let row = null;
    let col = null;
    const split = contentId.split('_');
    if (split.length > 1) {
      row = parseInt(split[0]);
      col = split[1];
    }

    if (keyCode === LEFT) {
      // LEFT arrow
      if (contentId === clearIconContainer) {
        this.commonService.focusToElement(platformInfoIconContainer);
      }
      else if (contentId === 'confirmationCancelButton') {
        this.commonService.focusToElement('confirmationOkButton');
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow			
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusToElement(clearIconContainer);
      }
      else if (contentId === 'confirmationOkButton') {
        this.commonService.focusToElement('confirmationCancelButton');
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusUp(contentId);
      }
      else if (col === 'cm') {
        const newRow = row - 1;
        let newFocus = newRow + '_cm';
        if (this.commonService.elementExist(newFocus)) {
          this.commonService.focusToElement(newFocus);
        }
      }
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusDown(contentId);
      }
      else if (col === 'cm') {
        const newRow = row + 1;
        let newFocus = newRow + '_cm';
        if (this.commonService.elementExist(newFocus)) {
          this.commonService.focusToElement(newFocus);
        }
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
        || contentId === searchIconContainer || contentId === favoritesIconContainer || contentId === channelInfoIconContainer) {
        this.commonService.showElementById('platformInfoBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (this.commonService.isSideBarMenuActive(contentId)) {
        if (contentId === platformInfoIconContainer) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement(clearIconContainer);
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
        else if (contentId === channelInfoIconContainer) {
          this.commonService.sideMenuSelection(channelInfoPage);
        }
      }
      else if (col === 'cm') {
        this.showConfirmationButtons(row, col);
      }
      else if (contentId === 'confirmationOkButton') {
        this.handleOkButtonSelection();
      }
      else if (contentId === 'confirmationCancelButton') {
        this.hideClearMenu();
      }
      else if (!this.clearMenuVisible) {
        this.showClearMenu();
      }
      else if (this.clearMenuVisible) {
        this.hideClearMenu();
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        this.commonService.focusToElement(clearIconContainer);
      }
      else if (this.clearMenuVisible) {
        this.hideClearMenu();
      }
      else {
        //this.commonService.showElementById('platformInfoBusyLoader');
        this.removeKeydownEventListener();
        this.commonService.toPage(archiveMainPage, null);
      }
    }
  }

  createMenuTexts(): void {
    this.removeMenuTexts();

    const itemsText = this.localeService.getLocaleTextById('itemsText');

    let itemCount = this.commonService.stringToJson(this.commonService.getSavedValue(videoStatusDataKey));
    if (!itemCount) {
      itemCount = [];
    }

    this.clearMenuItems.push(this.localeService.getLocaleTextById('videoStatusConfiguationText') + ' | ' + itemCount.length + ' ' + itemsText);

    itemCount = this.commonService.stringToJson(this.commonService.getSavedValue(favoritesDataKey + this.localeService.getArchiveLanguage()));
    if (!itemCount) {
      itemCount = [];
    }

    this.clearMenuItems.push(this.localeService.getLocaleTextById('favoritesConfigurationText') + ' | ' + itemCount.length + ' ' + itemsText);

    itemCount = this.commonService.stringToJson(this.commonService.getSavedValue(savedSearchDataKey + this.localeService.getSelectedLocale()));
    if (!itemCount) {
      itemCount = [];
    }

    this.clearMenuItems.push(this.localeService.getLocaleTextById('searchHistoryConfigurationText') + ' | ' + itemCount.length + ' ' + itemsText);
  }

  removeMenuTexts(): void {
    if (this.clearMenuItems) {
      this.clearMenuItems = [];
    }
  }

  showClearMenu(): void {
    this.commonService.showElementById('clearMenuContainer');

    this.createMenuTexts();

    setTimeout(() => {
      this.localeService.setLocaleText('deleteConfigurationsText');

      let height: number = this.commonService.getWindowHeight();
      height -= 280;
      height /= this.clearMenuItemMaxCount;
      height = height;

      //console.log('Item height: ', height);

      let elems: any = this.commonService.getElementsByClass(
        this.commonService.getElementById('clearMenuContainer'), 'clearMenuItems');
      if (elems) {
        for (let e of elems) {
          if (e) {
            e.style.height = height + 'px';
            e.style.lineHeight = height + 'px';
            e.style.fontSize = Math.ceil(0.70 * height) + 'px';
          }
        }
      }

      this.commonService.focusToElement('0_cm');
    });

    this.clearMenuVisible = true;
  }

  hideClearMenu(): void {
    this.commonService.hideElementById('clearMenuContainer');
    this.commonService.hideElementById('clearDataConfirmationContainer');

    this.removeMenuTexts();

    this.clearMenuVisible = false;

    this.commonService.focusToElement(clearIconContainer);
  }

  showConfirmationButtons(row: number, col: string): void {
    this.commonService.showElementById('clearDataConfirmationContainer');

    this.selectedClearMenuId = row + '_' + col;

    setTimeout(() => {
      this.localeService.setLocaleText('confirmationQuestionText');
      this.localeService.setLocaleText('confirmationOkButton');
      this.localeService.setLocaleText('confirmationCancelButton');

      this.commonService.focusToElement('confirmationOkButton');
    });
  }

  handleOkButtonSelection(): void {
    if (this.selectedClearMenuId === '0_cm') {
      this.commonService.removeSavedValue(videoStatusDataKey);
    }
    else if (this.selectedClearMenuId === '1_cm') {
      this.commonService.removeSavedValue(favoritesDataKey + this.localeService.getArchiveLanguage());
    }
    else if (this.selectedClearMenuId === '2_cm') {
      this.commonService.removeSavedValue(savedSearchDataKey + this.localeService.getSelectedLocale());
    }

    this.hideClearMenu();
  }

  calculateTableFontSize(): number {
    return Math.ceil(50 / 100 * ((this.commonService.getWindowWidth() / 2.4) / 11));
  }

  setFontSizes(tableFontSize: number): void {
    let platformInfoTable: any = this.commonService.getElementById('platformInfoTable');
    if (platformInfoTable) {
      let tableElements: any = this.commonService.getElementsByClass(platformInfoTable, 'platformInfoTableText');
      for (let e of tableElements) {
        if (e) {
          e.style.fontSize = tableFontSize + 'px';
        }
      }
    }

    let copyrightText: any = this.commonService.getElementById('copyrightText');
    if (copyrightText) {
      copyrightText.style.fontSize = (tableFontSize - 4) + 'px';
    }
  }
}
