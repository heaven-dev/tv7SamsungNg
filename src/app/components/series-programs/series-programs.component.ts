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
  seriesProgramsPage,
  categoryProgramsPage,
  programInfoPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  platformInfoIconContainer,
  seriesPageStateKey,
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
  selector: 'app-series-programs',
  templateUrl: './series-programs.component.html',
  styleUrls: ['./series-programs.component.css']
})
export class SeriesProgramsComponent implements OnInit, AfterViewInit {

  selectedProgram: any = null;
  limit: number = 16;
  offset: number = 0;
  seriesData: any = [];
  seriesId: number = null;
  loadingData: boolean = false;
  animationOngoing: boolean = false;

  rowIndex: number = 0;
  lastContentRowId: string = '';
  bottomMargin: number = 0;

  rowImageWidth: number = 0;
  rowItemHeight: number = 0;
  detailsFontSize: number = 0;

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private appService: AppService,
    private localeService: LocaleService,
    private archiveService: ArchiveService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(archiveIconContainer);

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
    this.detailsFontSize = 13 / 100 * this.rowItemHeight;
  }

  ngAfterViewInit(): void {
    this.localeService.setLocaleText('seriesText');

    this.selectedProgram = this.commonService.stringToJson(this.commonService.getValueFromCache(selectedArchiveProgramKey));
    if (this.selectedProgram) {
      //console.log('Selected program: ', selectedProgram);

      this.checkSeriesId();

      const pageState = this.getPageState();
      if (pageState) {
        //console.log('**Restore series data from cache.');
        this.restorePageState(pageState);
      }
      else {
        this.getSeriesData('0_c', true);
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const isConnected = this.commonService.isConnectedToGateway();
        if (!isConnected) {
          this.commonService.showElementById('noNetworkConnection');
        }
      }
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
        this.commonService.focusToElement(archiveIconContainer);
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow				
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusToElement(this.lastContentRowId);
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
        if (this.commonService.elementExist(newFocus) && !this.loadingData && !this.animationOngoing) {
          this.animationOngoing = true;

          this.rowMoveDownUp(row, true);
          this.commonService.focusToElement(newFocus);

          if (row > 0 && this.offset > 0 && row + this.limit / 2 === this.seriesData.length) {
            this.getSeriesData(newFocus, false);
          }
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
        this.commonService.showElementById('seriesBusyLoader');

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
        if (this.seriesData && this.seriesData[row]) {
          this.commonService.showElementById('seriesBusyLoader');

          this.archiveService.getProgramInfo(this.seriesData[row].id, (program: any) => {
            this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(program[0]));

            this.savePageState(row);

            this.commonService.hideElementById('seriesBusyLoader');
            this.removeKeydownEventListener();

            this.commonService.toPage(programInfoPage, seriesProgramsPage);
          });
        }
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        this.commonService.focusToElement(this.lastContentRowId);
      }
      else {
        this.commonService.showElementById('seriesBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPreviousPage(categoryProgramsPage);
      }
    }
  }

  rowMoveDownUp(row: number, down: boolean): void {
    const element = this.commonService.getElementById('seriesProgramsContainer');
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

  checkSeriesId(): void {
    if (this.selectedProgram.sid && this.selectedProgram.sid !== '') {
      this.seriesId = this.selectedProgram.sid;
    }
    else if (this.selectedProgram.series_id && this.selectedProgram.series_id !== '') {
      this.seriesId = this.selectedProgram.series_id;
    }
  }

  getSeriesData(focusElement: string, firstLoad: boolean): void {
    this.loadingData = true;
    this.commonService.showElementById('seriesBusyLoader');

    this.archiveService.getSeriesPrograms(this.seriesId, this.limit, this.offset, (data: any) => {
      this.seriesData = this.seriesData.concat(data);
      this.cdRef.detectChanges();

      //console.log('Series data: ', seriesData);

      if (data) {
        if (data.length < this.limit) {
          this.limit = -1;
          this.offset = -1;
        }
        else {
          this.offset = this.offset + data.length;
        }

        if (firstLoad) {
          this.setTitleText();
        }
      }

      setTimeout(() => {
        this.commonService.hideElementById('seriesBusyLoader');
        this.commonService.focusToElement(focusElement);
        this.loadingData = false;
      })
    });
  }

  getPageState(): any {
    let value = this.commonService.getValueFromCache(seriesPageStateKey);
    if (value) {
      return this.commonService.stringToJson(value);
    }
    return null;
  }

  savePageState(row: number): void {
    const pageState = {
      row: row,
      bottomMargin: this.bottomMargin,
      seriesData: this.commonService.jsonToString(this.seriesData),
      limit: this.limit,
      offset: this.offset
    };

    this.commonService.cacheValue(seriesPageStateKey, this.commonService.jsonToString(pageState));
  }

  deletePageState(): void {
    this.commonService.removeValueFromCache(seriesPageStateKey);
  }

  restorePageState(ps: any): void {
    if (ps) {
      this.commonService.showElementById('seriesBusyLoader');

      this.bottomMargin = ps.bottomMargin;
      let element = this.commonService.getElementById('seriesProgramsContainer');
      if (element) {
        element.style.bottom = this.bottomMargin + 'px';
      }

      this.seriesData = this.commonService.stringToJson(ps.seriesData);
      this.cdRef.detectChanges();

      this.setTitleText();

      this.limit = ps.limit;
      this.offset = ps.offset;

      this.deletePageState();

      setTimeout(() => {
        const focusRow = ps.row + '_c';
        this.commonService.focusToElement(focusRow);
        this.commonService.hideElementById('seriesBusyLoader');
      });
    }
  }

  setTitleText(): void {
    if (this.seriesData[0] && this.seriesData[0].series_name) {
      const seriesName = this.localeService.getLocaleTextById('seriesText') + ': ' + this.seriesData[0].series_name;
      this.commonService.addToElement('seriesText', seriesName);
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
}
