import { Component, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { AppService } from '../../services/app.service';
import { LocaleService } from '../../services/locale.service';
import { ArchiveService } from '../../services/archive.service';
import {
  searchTextKey,
  searchResultPage,
  seriesProgramsPage,
  nullValue,
  searchResultPageStateKey,
  tvMainPage,
  archiveMainPage,
  guidePage,
  searchPage,
  favoritesPage,
  platformInfoPage,
  programInfoPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  platformInfoIconContainer,
  selectedArchiveProgramKey,
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
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, AfterViewInit {

  searchData: any = [];
  hitCount: number = 0;

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

    this.appService.selectSidebarIcon(searchIconContainer);

    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.showElementById('noNetworkConnection');
      return;
    }

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.rowImageWidth = this.calculateImageWidth();
    this.rowItemHeight = this.calculateRowHeight();
  }

  ngAfterViewInit(): void {
    this.localeService.setLocaleText('searchResultText');

    const pageState = this.getPageState();
    if (pageState) {
      //console.log('**Restore search result data from cache.');
      this.restorePageState(pageState);
    }
    else {
      const queryString = this.commonService.getValueFromCache(searchTextKey);
      if (queryString) {
        //console.log('Query string: ', queryString);
        this.searchByString(queryString);
      }
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

    let row = 0;
    let col = '';
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
        this.commonService.focusToElement(searchIconContainer);
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow				
      if (this.commonService.isSideBarMenuActive(contentId)) {
        if (this.hitCount > 0) {
          this.commonService.focusToElement(this.lastContentRowId);
        }
        else {
          this.commonService.focusToElement('searchResultText');
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
        var newRow = row + 1;
        var newFocus = newRow + '_' + col;
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
        || contentId === searchIconContainer || contentId === favoritesIconContainer || contentId === platformInfoIconContainer) {
        this.commonService.showElementById('searchResultBusyLoader');

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
      else if (contentId === platformInfoIconContainer) {
        this.commonService.sideMenuSelection(platformInfoPage);
      }
      else {
        this.toItemPage(row);
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        if (this.hitCount > 0) {
          this.commonService.focusToElement(this.lastContentRowId);
        }
        else {
          this.commonService.focusToElement('searchResultText');
        }
      }
      else {
        this.commonService.showElementById('searchResultBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(searchPage, searchResultPage);
      }
    }
  }

  searchByString(queryString: string): void {
    this.commonService.showElementById('searchResultBusyLoader');

    this.archiveService.searchPrograms(queryString, (data: any) => {
      if (data) {
        //console.log('Search result: ', data);

        this.hitCount = 0;

        this.searchData = data['results'];
        this.cdRef.detectChanges();

        if (this.searchData) {
          this.hitCount = this.searchData.length;
        }

        this.commonService.hideElementById('searchResultBusyLoader');

        setTimeout(() => {
          if (this.hitCount > 0) {
            this.commonService.focusToElement('0_c');
          }
          else {
            this.commonService.focusToElement('searchResultText');
          }
        });

        if (!this.hitCount || this.hitCount === 0) {
          this.showNoHitsText();
        }
      }
    });
  }

  toItemPage(row: number): void {
    if (this.searchData[row]) {
      const data = this.searchData[row];

      //console.log('Selected item: ', data);

      this.savePageState(row);

      if (data.series_id && data.series_id !== '' && data.series_id !== nullValue && data.type === 'series') {
        this.archiveService.cacheData(selectedArchiveProgramKey, this.commonService.jsonToString(data));
        this.removeKeydownEventListener();

        this.commonService.toPage(seriesProgramsPage, searchResultPage);
      }
      else {
        this.commonService.showElementById('searchResultBusyLoader');
        this.archiveService.getProgramInfo(data.id, (program: any) => {
          this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(program[0]));

          this.commonService.hideElementById('searchResultBusyLoader');
          this.removeKeydownEventListener();

          this.commonService.toPage(programInfoPage, searchResultPage);
        });
      }
    }
  }

  rowMoveDownUp(row: number, down: boolean): void {
    const element = this.commonService.getElementById('searchResultContainer');
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
    const value = this.commonService.getValueFromCache(searchResultPageStateKey);
    if (value) {
      return this.commonService.stringToJson(value);
    }
    return null;
  }

  savePageState(row: number): void {
    const pageState = {
      row: row,
      bottomMargin: this.bottomMargin,
      searchData: this.commonService.jsonToString(this.searchData)
    }

    this.commonService.cacheValue(searchResultPageStateKey, this.commonService.jsonToString(pageState));
  }

  deletePageState(): void {
    this.commonService.removeValueFromCache(searchResultPageStateKey);
  }

  restorePageState(ps: any): void {
    if (ps) {
      this.commonService.showElementById('searchResultBusyLoader');

      this.bottomMargin = ps.bottomMargin;
      let element = this.commonService.getElementById('searchResultContainer');
      if (element) {
        element.style.bottom = this.bottomMargin + 'px';
      }

      this.searchData = this.commonService.stringToJson(ps.searchData);
      this.cdRef.detectChanges();

      this.hitCount = this.searchData.length;

      const focusRow = ps.row + '_c';
      this.commonService.focusToElement(focusRow);

      this.deletePageState();

      this.commonService.hideElementById('searchResultBusyLoader');

      if (!this.hitCount || this.hitCount === 0) {
        this.showNoHitsText();
      }
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

  showNoHitsText(): void {
    this.localeService.setLocaleText('noHitsText');
    this.commonService.showElementById('noHitsText');
  }

  isSeries(value: any): boolean {
    return value === 'series';
  }
}
