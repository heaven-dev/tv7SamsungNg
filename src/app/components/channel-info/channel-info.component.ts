import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { AppService } from '../../services/app.service';
import {
  LocaleService,
  localeFi,
  localeEt,
  localeRu,
  localeSv
} from '../../services/locale.service';

import {
  tvMainPage,
  archiveMainPage,
  guidePage,
  searchPage,
  favoritesPage,
  platformInfoPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  channelInfoIconContainer,
  platformInfoIconContainer,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC
} from '../../helpers/constants';

@Component({
  selector: 'app-channel-info',
  templateUrl: './channel-info.component.html',
  styleUrls: ['./channel-info.component.css']
})
export class ChannelInfoComponent implements OnInit, AfterViewInit {

  scrollTop: number = 0;

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private commonService: CommonService,
    private localeService: LocaleService,
    private appService: AppService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(channelInfoIconContainer);

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.scrollTop = 0;
  }

  ngAfterViewInit(): void {
    const selectedLocale = this.localeService.getSelectedLocale();
    if (selectedLocale === localeFi) {
      this.commonService.showElementById('localeFi');
    }
    else if (selectedLocale === localeEt) {
      this.commonService.showElementById('localeEt');
    }
    else if (selectedLocale === localeRu) {
      this.commonService.showElementById('localeRu');
    }
    else if (selectedLocale === localeSv) {
      this.commonService.showElementById('localeSv');
    }

    setTimeout(() => {
      let element = this.commonService.getElementById('channelInfoTextContainer');
      if (element) {
        element.style.height = (this.commonService.getWindowHeight() - 130) + 'px';
      }

      this.commonService.focusToElement('channelInfoContentContainer');
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
      if (contentId === 'channelInfoContentContainer') {
        this.commonService.focusToElement(channelInfoIconContainer);
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow			
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusToElement('channelInfoContentContainer');
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusUp(contentId);
      }
      else {
        this.moveUpDown(false);
      }
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusDown(contentId);
      }
      else {
        this.moveUpDown(true);
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
        || contentId === searchIconContainer || contentId === favoritesIconContainer || contentId === platformInfoIconContainer) {
        this.commonService.showElementById('channelInfoBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (this.commonService.isSideBarMenuActive(contentId)) {
        if (contentId === channelInfoIconContainer) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement('channelInfoContentContainer');
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
        else if (contentId === platformInfoIconContainer) {
          this.commonService.sideMenuSelection(platformInfoPage);
        }
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        this.commonService.focusToElement('channelInfoContentContainer');
      }
      else {
        //this.commonService.showElementById('channelInfoBusyLoader');
        this.removeKeydownEventListener();
        this.commonService.toPage(archiveMainPage, null);
      }
    }
  }

  moveUpDown(down: boolean): void {
    let element = this.commonService.getElementById('channelInfoTextContainer');
    if (element) {
      if (down) {
        this.scrollTop += 50;
        const maxScroll = element.scrollHeight - element.offsetHeight;
        if (this.scrollTop > maxScroll) {
          this.scrollTop = maxScroll;
        }
      }
      else {
        this.scrollTop -= 50;
        if (this.scrollTop < 0) {
          this.scrollTop = 0;
        }
      }

      element.scrollTop = this.scrollTop;
    }
  }
}
