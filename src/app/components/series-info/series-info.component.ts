import { Component, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { LocaleService } from '../../services/locale.service';
import { AppService } from '../../services/app.service';

import {
  selectedArchiveSeriesKey,
  selectedArchiveProgramKey,
  seriesIconContainer,
  favoriteIconContainer,
  tvMainPage,
  seriesProgramsPage,
  archiveMainPage,
  guidePage,
  favoritesPage,
  channelInfoPage,
  searchPage,
  platformInfoPage,
  seriesInfoPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  favoritesIconContainer,
  channelInfoIconContainer,
  searchIconContainer,
  platformInfoIconContainer,
  backgroundImage,
  favoritesDataKey,
  nullValue,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC
} from '../../helpers/constants';

@Component({
  selector: 'app-series-info',
  templateUrl: './series-info.component.html',
  styleUrls: ['./series-info.component.css']
})
export class SeriesInfoComponent implements OnInit, AfterViewInit {

  selectedSeries: any = null;

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

    this.selectedSeries = this.commonService.stringToJson(this.commonService.getValueFromCache(selectedArchiveSeriesKey));
    if (this.selectedSeries) {
      //console.log('Selected series: ', this.selectedSeries);

      this.commonService.focusToElement(seriesIconContainer);

      this.favoritesData = this.commonService.getSavedValue(favoritesDataKey + this.localeService.getArchiveLanguage());
      if (this.favoritesData) {
        this.favoritesData = this.commonService.stringToJson(this.favoritesData);

        //console.log('Favorites data: ', this.favoritesData);

        this.programFavoritesIndex = this.isProgramInFavorites();
      }
      else {
        this.favoritesData = [];
      }

      if (this.programFavoritesIndex !== -1) {
        this.setFavoriteIcon(this.favoriteSelectedIcon);
      }

      this.contentHeight = this.commonService.getWindowHeight() - 110;
      this.cdRef.detectChanges();

      this.addSeriesDetails();
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
      if (contentId === seriesIconContainer || contentId === backgroundImage) {
        this.commonService.focusToElement(archiveIconContainer);
      }
      else if (contentId === favoriteIconContainer) {
        this.commonService.focusToElement(seriesIconContainer);
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow				
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusToElement(seriesIconContainer);
      }
      else {
        this.commonService.focusToElement(favoriteIconContainer);
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
        this.commonService.showElementById('seriesInfoBusyLoader');

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
      else if (contentId === seriesIconContainer) {
        this.removeKeydownEventListener();

        this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(this.selectedSeries));
        this.commonService.toPage(seriesProgramsPage, seriesInfoPage);
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        this.commonService.focusToElement(seriesIconContainer);
      }
      else {
        this.removeKeydownEventListener();

        this.commonService.toPreviousPage(archiveMainPage);
      }
    }
  }

  addSeriesDetails(): void {
    if (this.selectedSeries) {
      if (this.selectedSeries.image_path && this.selectedSeries.image_path.length > 0) {
        this.commonService.addValueToAttribute('backgroundImage', 'src', this.selectedSeries.image_path);
      }
      else {
        this.commonService.addValueToAttribute('backgroundImage', 'src', 'assets/tv7logo.png');
      }

      if (this.selectedSeries.name) {
        this.commonService.addToElement('seriesName', this.selectedSeries.name);
      }

      if (this.selectedSeries.caption && this.selectedSeries.caption !== '' && this.selectedSeries.caption !== nullValue) {
        this.commonService.addToElement('caption', this.selectedSeries.caption);
      }

      if (this.selectedSeries.description && this.selectedSeries.description !== '' && this.selectedSeries.description !== nullValue) {
        this.commonService.addToElement('description', this.selectedSeries.description);
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
    const { sid } = this.selectedSeries;

    if (this.favoritesData) {
      for (let i = 0; i < this.favoritesData.length; i++) {
        const item = this.favoritesData[i];
        if (item && item.sid === sid && item.is_series) {
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
      this.favoritesData.push(this.selectedSeries);

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
