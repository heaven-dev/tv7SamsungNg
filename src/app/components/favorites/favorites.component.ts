import { Component, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { AppService } from '../../services/app.service';
import { LocaleService } from '../../services/locale.service';
import { ArchiveService } from '../../services/archive.service';
import {
  tvMainPage,
  archiveMainPage,
  guidePage,
  searchPage,
  favoritesPage,
  platformInfoPage,
  programInfoPage,
  errorPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  platformInfoIconContainer,
  selectedArchiveProgramKey,
  favoritesDataKey,
  favoritesPageStateKey,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC
} from '../../helpers/constants';

import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit, AfterViewInit {

  favoritesData: any = [];

  rowImageWidth: number = 0;
  rowItemHeight: number = 0;
  rowIndex: number = 0;

  bottomMargin: number = 0;
  animationOngoing: boolean = false;
  lastContentRowId: string = '';

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private appService: AppService,
    private archiveService: ArchiveService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(favoritesIconContainer);

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.rowImageWidth = this.calculateImageWidth();
    this.rowItemHeight = this.calculateRowHeight();
  }

  ngAfterViewInit(): void {
    this.localeService.setLocaleText('favoritesText');

    const pageState = this.getPageState();
    if (pageState) {
      //console.log('**Restore favorites data from cache.');
      this.restorePageState(pageState);
    }
    else {
      this.favoritesData = this.commonService.getSavedValue(favoritesDataKey + this.localeService.getArchiveLanguage());
      if (this.favoritesData) {
        this.favoritesData = this.commonService.stringToJson(this.favoritesData);
      }
      this.preparePage();

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

    let row: any = 0;
    let col: any = '';
    const split = contentId.split('_');

    if (split && split.length === 2 && split[1] === 'c') {
      row = parseInt(split[0]);
      col = split[1];

      this.lastContentRowId = contentId;
    }

    e.preventDefault();

    if (keyCode === LEFT) {
      // LEFT arrow
      if (!this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusToElement(favoritesIconContainer);
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow				
      if (this.commonService.isSideBarMenuActive(contentId)) {
        if (this.favoritesData && this.favoritesData.length > 0) {
          this.commonService.focusToElement(this.lastContentRowId);
        }
        else {
          this.commonService.focusToElement('favoritesText');
        }
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (!this.commonService.isSideBarMenuActive(contentId)) {
        const newRow = row - 1;
        const newFocus = newRow + '_' + col;
        if (this.commonService.elementExist(newFocus) && !this.animationOngoing) {
          this.animationOngoing = true;

          this.rowMoveDownUp(row, false);
          this.commonService.focusToElement(newFocus);
        }
      }
      else {
        this.commonService.menuFocusUp(contentId);
      }
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      if (!this.commonService.isSideBarMenuActive(contentId)) {
        const newRow = row + 1;
        const newFocus = newRow + '_' + col;
        if (this.commonService.elementExist(newFocus) && !this.animationOngoing) {
          this.animationOngoing = true;

          this.rowMoveDownUp(row, true);
          this.commonService.focusToElement(newFocus);
        }
      }
      else {
        this.commonService.menuFocusDown(contentId);
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
        || contentId === searchIconContainer || contentId === platformInfoIconContainer) {
        this.commonService.showElementById('favoritesBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (contentId === favoritesIconContainer) {
        this.commonService.focusOutFromMenuEvent();

        if (this.favoritesData && this.favoritesData.length > 0) {
          this.commonService.focusToElement(this.lastContentRowId);
        }
        else {
          this.commonService.focusToElement('favoritesText');
        }
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
      else if (contentId === platformInfoIconContainer) {
        this.commonService.sideMenuSelection(platformInfoPage);
      }
      else {
        this.toProgramInfoPage(row);
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        if (this.favoritesData && this.favoritesData.length > 0) {
          this.commonService.focusToElement(this.lastContentRowId);
        }
        else {
          this.commonService.focusToElement('favoritesText');
        }
      }
      else {
        //this.commonService.showElementById('favoritesBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(archiveMainPage, null);
      }
    }
  }

  toProgramInfoPage(row: number): void {
    if (this.favoritesData) {
      this.savePageState(row);

      const id = this.favoritesData[row].id;

      this.commonService.showElementById('favoritesBusyLoader');
      this.removeKeydownEventListener();

      const isConnected = this.commonService.isConnectedToGateway();
      if (!isConnected) {
        this.commonService.hideElementById('favoritesBusyLoader');
        this.commonService.toPage(errorPage, null);
      }
      else {
        this.archiveService.getProgramInfo(id, (program: any) => {
          this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(program[0]));

          this.commonService.hideElementById('favoritesBusyLoader');


          this.commonService.toPage(programInfoPage, favoritesPage);
        });
      }
    }
  }

  rowMoveDownUp(row: number, down: boolean): void {
    const element = this.commonService.getElementById('favoritesContainer');
    if (element) {
      const rowHeight = this.calculateRowHeight();
      const rowHeightAndMargin = rowHeight + 40;

      if (down) {
        if (row > 0) {
          this.bottomMargin += rowHeightAndMargin;
        }
      }
      else {
        if (row > 1) {
          this.bottomMargin -= rowHeightAndMargin;
        }
      }

      //console.log('Bottom margin value: ', bottomMargin);

      anime({
        targets: element,
        bottom: this.bottomMargin + 'px',
        duration: 180,
        easing: 'linear',
        complete: () => {
          this.animationOngoing = false;
        }
      });
    }
  }

  getPageState(): any {
    const value = this.commonService.getValueFromCache(favoritesPageStateKey);
    if (value) {
      return this.commonService.stringToJson(value);
    }
    return null;
  }

  savePageState(row: number): void {
    const pageState = {
      row: row,
      favoritesCount: this.favoritesData.length,
      bottomMargin: this.bottomMargin
    }

    this.commonService.cacheValue(favoritesPageStateKey, this.commonService.jsonToString(pageState));
  }

  deletePageState(): void {
    this.commonService.removeValueFromCache(favoritesPageStateKey);
  }

  restorePageState(ps: any): void {
    if (ps) {
      this.commonService.showElementById('favoritesBusyLoader');

      //console.log('Page state: ', ps);

      let savedFavoritesCount = 0;
      this.favoritesData = this.commonService.getSavedValue(favoritesDataKey + this.localeService.getArchiveLanguage());
      if (this.favoritesData) {
        this.favoritesData = this.commonService.stringToJson(this.favoritesData);
        this.cdRef.detectChanges();

        savedFavoritesCount = this.favoritesData.length;
      }

      const sameCount = savedFavoritesCount === ps.favoritesCount;

      this.bottomMargin = sameCount ? ps.bottomMargin : 0;
      let element = this.commonService.getElementById('favoritesContainer');
      if (element) {
        element.style.bottom = this.bottomMargin + 'px';
      }

      const focusRow = sameCount ? ps.row + '_c' : '0_c';
      this.commonService.focusToElement(focusRow);

      this.deletePageState();

      if (!this.favoritesData || this.favoritesData.length === 0) {
        this.showNoFavoritesText();
      }

      this.commonService.hideElementById('favoritesBusyLoader');
    }
  }

  calculateImageWidth(): number {
    const height = this.calculateRowHeight();
    return Math.round(height / 0.56);
  }

  calculateRowHeight(): number {
    const height = this.commonService.getWindowHeight() - 280;
    return Math.round(height / 3.5);
  }

  preparePage(): void {
    setTimeout(() => {
      if (this.favoritesData && this.favoritesData.length > 0) {
        this.commonService.focusToElement('0_c');
      }
      else {
        this.commonService.focusToElement('favoritesText');
        this.showNoFavoritesText();
      }
    });
  }

  showNoFavoritesText(): void {
    this.localeService.setLocaleText('noFavoritesText');
    this.commonService.showElementById('noFavoritesText');
  }
}
