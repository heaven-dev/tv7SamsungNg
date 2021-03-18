import { Component, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { LocaleService } from '../../services/locale.service';
import { AppService } from '../../services/app.service';

import {
  videoStatusDataKey,
  selectedArchiveProgramKey,
  playIconContainer,
  favoriteIconContainer,
  tvMainPage,
  archiveMainPage,
  guidePage,
  favoritesPage,
  channelInfoPage,
  searchPage,
  platformInfoPage,
  archivePlayerPage,
  programInfoPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  favoritesIconContainer,
  channelInfoIconContainer,
  searchIconContainer,
  platformInfoIconContainer,
  backgroundImage,
  favoritesDataKey,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC,
} from '../../helpers/constants';

@Component({
  selector: 'app-program-info',
  templateUrl: './program-info.component.html',
  styleUrls: ['./program-info.component.css']
})
export class ProgramInfoComponent implements OnInit, AfterViewInit {

  selectedProgram: any = null;
  showPlayBtn: boolean = false;
  showFavoriteBtn: boolean = false;
  comingProgram: boolean = false;

  programFavoritesIndex: number = -1;
  favoritesData: any = [];
  favoriteSelectedIcon: string = 'assets/favorites.svg';
  favoriteNotSelectedIcon: string = 'assets/favorites_not_selected.svg';
  textAnimationDuration: number = 1400;
  contentHeight: number = 0;

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private localeService: LocaleService,
    private appService: AppService) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(archiveIconContainer);

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });
  }

  ngAfterViewInit(): void {
    this.localeService.setLocaleText('addedToFavoritesText');
    this.localeService.setLocaleText('removedFromFavoritesText');

    this.selectedProgram = this.commonService.stringToJson(this.commonService.getValueFromCache(selectedArchiveProgramKey));
    if (this.selectedProgram) {
      //console.log('Program data: ', this.selectedProgram);

      this.showFavoriteBtn = true;

      if (this.selectedProgram.is_visible_on_vod === '0') {
        this.showPlayBtn = false;
        this.comingProgram = true;
      }
      else if (this.selectedProgram.is_visible_on_vod === '1') {
        this.showPlayBtn = true;
        this.comingProgram = false;
      }
      else if (this.selectedProgram.is_visible_on_vod === '2') {
        this.showPlayBtn = true;
        this.comingProgram = true;
      }
      else if (this.selectedProgram.is_visible_on_vod === '-1') {
        this.showPlayBtn = false;
        this.comingProgram = false;
        this.showFavoriteBtn = false;

        this.commonService.hideElementById('isInArchiveIconContainer');
      }

      if (this.showPlayBtn) {
        this.commonService.showElementById(playIconContainer);
      }

      if (this.showFavoriteBtn) {
        this.commonService.showElementById(favoriteIconContainer);
      }

      if (this.showPlayBtn) {
        this.commonService.focusToElement(playIconContainer);
      }
      else if (this.showFavoriteBtn) {
        this.commonService.focusToElement(favoriteIconContainer);
      }
      else {
        this.commonService.focusToElement(backgroundImage);
      }

      this.favoritesData = this.commonService.getSavedValue(favoritesDataKey + this.localeService.getArchiveLanguage());
      if (this.favoritesData) {
        this.favoritesData = this.commonService.stringToJson(this.favoritesData);

        this.programFavoritesIndex = this.isProgramInFavorites();
      }
      else {
        this.favoritesData = [];
      }

      if (this.programFavoritesIndex !== -1) {
        this.setFavoriteIcon(this.favoriteSelectedIcon);
      }

      let videoStatus: any = this.commonService.getSavedValue(videoStatusDataKey);
      if (videoStatus) {
        videoStatus = this.commonService.stringToJson(videoStatus);
        //console.log('Video statuses: ', videoStatus);

        const { id } = this.selectedProgram;

        let videoItem = null;
        for (let i = 0; i < videoStatus.length; i++) {
          if (videoStatus[i].id === id) {
            videoItem = videoStatus[i];
            break;
          }
        }

        if (videoItem) {
          //console.log('Video status: ', videoItem);

          let elem = this.commonService.getElementById('videoStatusBar');
          if (elem) {
            elem.style.width = videoItem.p + '%';
          }
        }
      }

      this.contentHeight = this.commonService.getWindowHeight() - 110;
      this.cdRef.detectChanges();

      this.addProgramDetails();
    }
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
      if (contentId === playIconContainer || contentId === backgroundImage) {
        this.commonService.focusToElement(archiveIconContainer);
      }
      else if (contentId === favoriteIconContainer) {
        if (this.showPlayBtn) {
          this.commonService.focusToElement(playIconContainer);
        }
        else {
          this.commonService.focusToElement(archiveIconContainer);
        }
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow				
      if (this.commonService.isSideBarMenuActive(contentId)) {
        if (this.showPlayBtn) {
          this.commonService.focusToElement(playIconContainer);
        }
        else if (this.showFavoriteBtn) {
          this.commonService.focusToElement(favoriteIconContainer);
        }
        else {
          this.commonService.focusToElement(backgroundImage);
        }
      }
      else {
        if (contentId === playIconContainer) {
          this.commonService.focusToElement(favoriteIconContainer);
        }
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      this.commonService.menuFocusUp(contentId);
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      this.commonService.menuFocusDown(contentId);
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
        || contentId === searchIconContainer || contentId === favoritesIconContainer || contentId === channelInfoIconContainer
        || contentId === platformInfoIconContainer) {
        this.commonService.showElementById('programInfoBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (contentId === tvIconContainer) {
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
      else if (contentId === platformInfoIconContainer) {
        this.commonService.sideMenuSelection(platformInfoPage);
      }
      else if (contentId === favoriteIconContainer) {
        if (this.programFavoritesIndex === -1) {
          this.addProgramToFavorites();
        }
        else {
          this.removeProgramToFavorites();
        }
      }
      else if (contentId === playIconContainer) {
        this.commonService.hideElementById('toolbarContainer');
        this.commonService.hideElementById('sidebar');
        this.removeKeydownEventListener();

        this.commonService.toPage(archivePlayerPage, programInfoPage);
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        if (this.showPlayBtn) {
          this.commonService.focusToElement(playIconContainer);
        }
        else if (this.showFavoriteBtn) {
          this.commonService.focusToElement(favoriteIconContainer);
        }
        else {
          this.commonService.focusToElement(backgroundImage);
        }
      }
      else {
        //this.commonService.showElementById('programInfoBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPreviousPage(archiveMainPage);
      }
    }
  }

  addProgramDetails(): void {
    if (this.selectedProgram) {
      if (this.selectedProgram.image_path && this.selectedProgram.image_path.length > 0) {
        this.commonService.addValueToAttribute('backgroundImage', 'src', this.selectedProgram.image_path);
      }
      else {
        this.commonService.addValueToAttribute('backgroundImage', 'src', 'assets/tv7logo.png');
      }

      if (this.selectedProgram.name_desc) {
        this.commonService.addToElement('nameDesc', this.selectedProgram.name_desc);
      }

      if (this.selectedProgram.caption) {
        this.commonService.addToElement('caption', this.selectedProgram.caption);
      }

      if (this.selectedProgram.episode_number && this.selectedProgram.episode_number !== '0') {
        this.commonService.addToElement('episodeNumber', this.localeService.getLocaleTextById('episodeText') + ': ' + this.selectedProgram.episode_number);
      }

      if (this.selectedProgram.duration_time) {
        this.commonService.addToElement('duration', this.localeService.getLocaleTextById('durationText') + ': ' + this.selectedProgram.duration_time);
      }

      if (this.selectedProgram.broadcast_date_time) {
        const title = this.comingProgram ? this.localeService.getLocaleTextById('comingProgramsText') : this.localeService.getLocaleTextById('firstBroadcastText');
        this.commonService.addToElement('firstBroadcast', title + ': ' + this.selectedProgram.broadcast_date_time);
      }

      if (this.selectedProgram.aspect_ratio && this.selectedProgram.aspect_ratio !== '16:9') {
        this.commonService.addToElement('aspectRatioText', this.localeService.getLocaleTextById('aspectRatioText') + ': ' + this.selectedProgram.aspect_ratio);
        this.commonService.showElementById('aspectRatioText');
      }
    }
  }

  setFavoriteIcon(icon: string): void {
    const favoriteIcon = this.commonService.getElementById('favoriteIcon');
    if (favoriteIcon && icon) {
      favoriteIcon.setAttribute('src', icon);
    }
  }

  isProgramInFavorites(): number {
    let index = -1;
    const programId = this.selectedProgram.id;

    if (this.favoritesData) {
      for (let i = 0; i < this.favoritesData.length; i++) {
        const item = this.favoritesData[i];
        if (item && item.id === programId) {
          index = i;

          break;
        }
      }
    }

    return index;
  }

  addProgramToFavorites(): void {
    this.programFavoritesIndex = this.isProgramInFavorites();

    if (this.programFavoritesIndex === -1) {
      this.favoritesData.push(this.selectedProgram);

      this.programFavoritesIndex = this.favoritesData.length - 1;
      this.commonService.saveValue(
        favoritesDataKey + this.localeService.getArchiveLanguage(),
        this.commonService.jsonToString(this.favoritesData)
      );
      this.setFavoriteIcon(this.favoriteSelectedIcon);

      this.handleTextAnimation('addedToFavoritesText');
    }
  }

  removeProgramToFavorites(): void {
    this.programFavoritesIndex = this.isProgramInFavorites();
    if (this.programFavoritesIndex !== -1) {
      this.favoritesData.splice(this.programFavoritesIndex, 1);

      this.programFavoritesIndex = -1;
      this.commonService.saveValue(
        favoritesDataKey + this.localeService.getArchiveLanguage(),
        this.commonService.jsonToString(this.favoritesData)
      );
      this.setFavoriteIcon(this.favoriteNotSelectedIcon);

      this.handleTextAnimation('removedFromFavoritesText');
    }
  }

  handleTextAnimation(element: string): void {
    const addedToFavoritesText = this.commonService.getElementById(element);
    if (addedToFavoritesText) {
      addedToFavoritesText.style.display = 'block';
      setTimeout(() => {
        addedToFavoritesText.style.display = 'none';
      }, this.textAnimationDuration)
    }
  }
}
