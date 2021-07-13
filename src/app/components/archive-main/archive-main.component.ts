import { Component, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { ArchiveService } from '../../services/archive.service';
import { AppService } from '../../services/app.service';
import { LocaleService } from '../../services/locale.service';
import { ProgramScheduleService } from '../../services/program-schedule.service';
import {
  categoryDefaultRowCol,
  archivePageStateKey,
  selectedCategoryKey,
  selectedArchiveProgramKey,
  selectedArchiveSeriesKey,
  defaultRowCol,
  archiveIconContainer,
  tvIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  channelInfoIconContainer,
  platformInfoIconContainer,
  tvMainPage,
  categoryProgramsPage,
  programInfoPage,
  seriesInfoPage,
  archiveMainPage,
  guidePage,
  searchPage,
  favoritesPage,
  channelInfoPage,
  platformInfoPage,
  errorPage,
  categoryRowNumber,
  seriesRowNumber,
  programScheduleDataKey,
  programScheduleYesterdayDataKey,
  nullValue,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC,
  exitCancelButton,
  exitYesButton,
  runOnBrowser
} from '../../helpers/constants';

import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-archive-main',
  templateUrl: './archive-main.component.html',
  styleUrls: ['./archive-main.component.css']
})
export class ArchiveMainComponent implements OnInit, AfterViewInit {
  modalVisible = false;

  recommendedMargin: number = 0;
  mostViewedMargin: number = 0;
  newestMargin: number = 0;
  categoriesMargin: number = 0;
  seriesMargin: number = 0;
  bottomMargin: number = 0;
  animationOngoing: boolean = false;

  recommendedRowWidth: number = 0;
  mostViewedRowWidth: number = 0;
  newestRowWidth: number = 0;
  categoriesRowWidth: number = 0;
  seriesRowWidth: number = 0;

  programRowItemWidth: number = 0;
  categoriesSeriesRowItemWidth: number = 0;
  programRowItemHeight: number = 0;
  categoriesRowItemHeight: number = 0;

  rowFocusWas: any = null;
  colFocusWas: any = [null, null, null, null];

  recommended: any = null;
  mostViewed: any = null;
  newest: any = null;
  seriesData: any = null;
  categories: any = null;
  archivePageImage: string = '';

  lastParentCategoryId: any = null;
  subCategoriesVisible: boolean = false;
  categoriesVisible: boolean = true;

  pageState: any = null;

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private appService: AppService,
    private archiveService: ArchiveService,
    private commonService: CommonService,
    private localeService: LocaleService,
    private programScheduleService: ProgramScheduleService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(archiveIconContainer);

    this.localeService.setLocaleText('recommendedProgramsText');
    this.localeService.setLocaleText('mostViewedProgramsText');
    this.localeService.setLocaleText('newestProgramsText');
    this.localeService.setLocaleText('categoriesText');
    this.localeService.setLocaleText('topicalSeriesText');

    this.archivePageImage = this.localeService.getArchivePageImage();

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.programRowItemWidth = this.calculateItemWidth() - 20;
    this.categoriesSeriesRowItemWidth = this.calculateItemWidth() - 40;
    this.programRowItemHeight = this.calculateRowHeight() - 20;
    this.categoriesRowItemHeight = this.calculateRowHeight() - 40;
  }

  ngAfterViewInit(): void {
    this.pageState = this.getPageState();

    this.setRowHeightValues();

    this.commonService.removeOriginPage();

    this.restoreBottomMargin(this.pageState);

    this.showBusyLoaders();

    // get data
    const todayDate = this.commonService.getTodayDate();
    const archiveLanguage = this.localeService.getArchiveLanguage();

    this.readRecommendedPrograms(todayDate, 30, 0, this.pageState);
    this.readMostViewedPrograms(archiveLanguage, this.pageState);
    this.readNewestPrograms(todayDate, 30, 0, null, this.pageState);

    if (this.pageState && this.pageState.subCategoryId) {
      this.readSubCategories(this.pageState, true, () => { });
    }
    else {
      this.readParentCategories(this.pageState, true, () => { });
    }

    this.readSeries(this.pageState);
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
      col = parseInt(split[1]);
    }

    this.colFocusWas[row] = contentId.split('_')[1];

    if (keyCode === LEFT) {
      // LEFT arrow
      if (this.modalVisible) {
        if (contentId === exitCancelButton) {
          this.commonService.focusToElement(exitYesButton);
        }
      }
      else {
        if (col === 0) {
          this.rowFocusWas = contentId;
          this.commonService.focusToElement(archiveIconContainer);
        }
        else {
          const newCol = col - 1;
          const newFocus = row + '_' + newCol;
          if (this.commonService.elementExist(newFocus) && !this.animationOngoing) {
            this.animationOngoing = true;

            this.rowMoveLeftRight(row, newCol, false);
            this.commonService.focusToElement(newFocus);
          }
        }
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow				
      if (this.modalVisible) {
        if (contentId === exitYesButton) {
          this.commonService.focusToElement(exitCancelButton);
        }
      }
      else {
        if (this.commonService.isSideBarMenuActive(contentId)) {
          if (this.rowFocusWas) {
            this.commonService.focusToElement(this.rowFocusWas);
          }
          else {
            this.commonService.focusToElement(defaultRowCol);
          }
        }
        else {
          const newCol = col + 1;
          const newFocus = row + '_' + newCol;
          if (this.commonService.elementExist(newFocus) && !this.animationOngoing) {
            this.animationOngoing = true;

            this.rowMoveLeftRight(row, newCol, true);
            this.commonService.focusToElement(newFocus);
          }
        }
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (!this.modalVisible) {
        if (this.commonService.isSideBarMenuActive(contentId)) {
          this.commonService.menuFocusUp(contentId);
        }
        else {
          const newRow = row - 1;
          const newFocus = newRow + '_' + (this.colFocusWas[newRow] ? this.colFocusWas[newRow] : 0);
          if (this.commonService.elementExist(newFocus) && !this.animationOngoing) {
            this.animationOngoing = true;

            this.rowMoveUpDown(newRow, false);
            this.commonService.focusToElement(newFocus);
          }
        }
      }
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      if (!this.modalVisible) {
        if (this.commonService.isSideBarMenuActive(contentId)) {
          this.commonService.menuFocusDown(contentId);
        }
        else {
          const newRow = row + 1;
          const newFocus = newRow + '_' + (this.colFocusWas[newRow] || 0);
          if (this.commonService.elementExist(newFocus) && !this.animationOngoing) {
            this.animationOngoing = true;

            this.rowMoveUpDown(newRow, true);
            this.commonService.focusToElement(newFocus);
          }
        }
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (!this.modalVisible) {
        if (contentId === tvIconContainer || contentId === guideIconContainer || contentId === searchIconContainer
          || contentId === favoritesIconContainer || contentId === channelInfoIconContainer || contentId === platformInfoIconContainer) {
          this.commonService.showElementById('commonBusyLoader');
          this.commonService.focusOutFromMenuEvent();

          this.removeKeydownEventListener();
        }

        if (contentId === archiveIconContainer) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement(this.rowFocusWas);
        }
        else if (contentId === tvIconContainer) {
          this.commonService.sideMenuSelection(tvMainPage);
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
        else {
          if (row === categoryRowNumber) {
            this.handleCategorySelection(row, col, this.pageState);
          }
          else if (row === seriesRowNumber) {
            this.toSeriesInfoPage(row, col);
          }
          else {
            this.toProgramInfoPage(row, col);
          }
        }
      }
      else {
        if (document.activeElement.id === exitYesButton) {
          // yes selected => exit from application
          if (!runOnBrowser) {
            this.removeKeydownEventListener();
            // @ts-ignore
            tizen.application.getCurrentApplication().exit();
          }
        }
        else {
          // cancel selected => to main view
          this.commonService.hideElementById('exitModal');
          this.commonService.focusToElement(this.rowFocusWas);

          this.modalVisible = false;
        }
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (!this.modalVisible) {
        if (this.commonService.isSideBarMenuActive(contentId)) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement(this.rowFocusWas);
        }
        else {
          this.rowFocusWas = contentId;

          this.commonService.showElementById('exitModal');
          this.commonService.focusToElement(exitYesButton);

          this.modalVisible = true;
        }
      }
      else {
        // to archive main view
        this.commonService.hideElementById('exitModal');
        this.commonService.focusToElement(this.rowFocusWas);

        this.modalVisible = false;
      }
    }
  }

  rowMoveUpDown(row: number, down: boolean): void {
    const rowHeight = this.calculateRowHeight();
    const rowAndTitleHeight = rowHeight + 60;

    const element = this.commonService.getElementById('contentRows');
    if (element) {
      if (down) {
        if (row > 1) {
          this.bottomMargin += rowAndTitleHeight;
        }
      }
      else {
        if (row > 0) {
          this.bottomMargin -= rowAndTitleHeight;
        }
      }

      //console.log('Bottom margin value: ', bottomMargin);

      element.style.bottom = this.bottomMargin + 'px';
      this.animationOngoing = false;

      /*
      anime({
        targets: element,
        bottom: this.bottomMargin + 'px',
        duration: 180,
        easing: 'easeInOutCirc',
        complete: () => {
          this.animationOngoing = false;
        }
      });
      */
    }
  }

  rowMoveLeftRight(row: number, col: number, right: boolean): void {
    let rowElement = null;
    let margin = 0;

    if (row === 0) {
      rowElement = 'recommendedPrograms';
      margin = this.calculateRightMargin(col, right, this.recommendedMargin);
      this.recommendedMargin = margin;
    }
    else if (row === 1) {
      rowElement = 'mostViewedPrograms';
      margin = this.calculateRightMargin(col, right, this.mostViewedMargin);
      this.mostViewedMargin = margin;
    }
    else if (row === 2) {
      rowElement = 'newestPrograms';
      margin = this.calculateRightMargin(col, right, this.newestMargin);
      this.newestMargin = margin;
    }
    else if (row === 3) {
      rowElement = 'categories';
      margin = this.calculateRightMargin(col, right, this.categoriesMargin);
      this.categoriesMargin = margin;
    }
    else if (row === 4) {
      rowElement = 'series';
      margin = this.calculateRightMargin(col, right, this.seriesMargin);
      this.seriesMargin = margin;
    }

    const element = this.commonService.getElementById(rowElement);
    if (element) {
      //console.log('Right margin value: ', margin);

      anime({
        targets: element,
        right: margin + 'px',
        duration: 180,
        easing: 'easeInOutCirc',
        complete: () => {
          this.animationOngoing = false;
        }
      });
    }
  }

  calculateRightMargin(col: number, right: boolean, margin: number): number {
    const itemWidth = this.calculateItemWidth();
    const itemWidthWithMargin = itemWidth + 10;

    if (col > 1) {
      if (col === 2 && right) {
        margin -= Math.round(itemWidth / 10);
      }

      margin = right ? margin + itemWidthWithMargin : margin - itemWidthWithMargin;
    }
    else {
      margin = 0;
    }

    return margin;
  }

  handleCategorySelection(row: number, col: number, pageState: any): void {
    if (this.subCategoriesVisible) {
      if (this.categories) {
        if (col === this.categories.length) {
          this.categoriesVisible = false;
          this.commonService.showElementById('categoriesBusyLoader');

          this.changeRowBackgroundColor('categoriesContainer', '#eeeeee');

          this.readParentCategories(pageState, false, (data: any) => {
            this.resetCategoriesPosition();
            this.restoreCategoriesTitleText();

            this.commonService.hideElementById('categoriesBusyLoader');

            this.changeRowBackgroundColor('categoriesContainer', '#ffffff');

            this.categoriesVisible = true;

            setTimeout(() => {
              this.commonService.focusToElement(categoryDefaultRowCol);
            });
          });
        }
        else {
          this.savePageState(row, col);
          this.commonService.hideElementById('contentRows');
          this.toCategoryProgramsPage(this.categories[col]);
        }
      }
    }
    else {
      let parentCategoryName = null;
      if (this.categories && this.categories[col]) {
        this.lastParentCategoryId = this.categories[col].id;
        parentCategoryName = this.categories[col].name;
      }

      this.categoriesVisible = false;
      this.commonService.showElementById('categoriesBusyLoader');

      this.changeRowBackgroundColor('categoriesContainer', '#eeeeee');

      this.readSubCategories(pageState, false, (data: any) => {
        if (data && data.length === 1) {
          this.savePageState(row, col);
          this.commonService.hideElementById('contentRows');
          this.toCategoryProgramsPage(data[0]);
        }
        else {
          this.resetCategoriesPosition();
          this.changeCategoriesTitleText(parentCategoryName);

          this.commonService.hideElementById('categoriesBusyLoader');

          this.changeRowBackgroundColor('categoriesContainer', '#ffffff');

          this.categoriesVisible = true;

          setTimeout(() => {
            this.commonService.focusToElement(categoryDefaultRowCol);
          });
        }
      });
    }
  }

  resetCategoriesPosition(): void {
    this.categoriesMargin = 0;

    const elem = this.commonService.getElementById('categories');
    if (elem) {
      elem.style.right = 0;
    }
  }

  getProgramDataByRowAndCol(row: number, col: number): any {
    if (row === 0) {
      return this.recommended[col];
    }
    else if (row === 1) {
      return this.mostViewed[col];
    }
    else if (row === 2) {
      return this.newest[col];
    }
  }

  savePageState(row: number, col: number): void {
    let margin = 0;
    let subCategoryId = null;

    if (row === 0) {
      margin = this.recommendedMargin;
    }
    else if (row === 1) {
      margin = this.mostViewedMargin;
    }
    else if (row === 2) {
      margin = this.newestMargin;
    }
    else if (row === 3) {
      margin = this.categoriesMargin;
      if (this.subCategoriesVisible && this.categories && this.categories[col]) {
        subCategoryId = this.categories[col].category_id;
      }
    }
    else if (row === 4) {
      margin = this.seriesMargin;
    }

    const pageState = {
      row: row,
      col: col,
      focusElementId: row + '_' + col,
      focusRow: row,
      focusCol: col,
      rightMargin: margin,
      bottomMargin: this.bottomMargin,
      subCategoryId: subCategoryId,
      lastParentCategoryId: this.lastParentCategoryId
    };

    //console.log('Save page state: ', pageState);

    this.commonService.cacheValue(archivePageStateKey, this.commonService.jsonToString(pageState));
  }

  getPageState(): any {
    return this.commonService.stringToJson(this.commonService.getValueFromCache(archivePageStateKey));
  }

  restoreRightMargin(pageState: any, elementId: string, row: number): void {
    if (pageState) {
      //console.log('Page state: ', pageState);

      let marginVariable = null;
      if (row === 0) {
        marginVariable = 'recommendedMargin';
      }
      else if (row === 1) {
        marginVariable = 'mostViewedMargin';
      }
      else if (row === 2) {
        marginVariable = 'newestMargin';
      }
      else if (row === 3) {
        marginVariable = 'categoriesMargin';
      }
      else if (row === 4) {
        marginVariable = 'seriesMargin';
      }

      let marginValue = pageState['rightMargin'];
      let elem = this.commonService.getElementById(elementId);
      if (elem) {
        let focusRow = pageState['focusRow'];

        if (focusRow === row) {
          elem.style.right = marginValue + 'px';
          this.saveRightMarginValue(row, marginValue);

          const focusElementId = pageState['focusElementId']
          if (focusElementId) {
            this.commonService.focusToElement(focusElementId);
          }
        }
      }
    }
  }

  saveRightMarginValue(row: number, value: number): void {
    if (row === 0) {
      this.recommendedMargin = value;
    }
    else if (row === 1) {
      this.mostViewedMargin = value;
    }
    else if (row === 2) {
      this.newestMargin = value;
    }
    else if (row === 3) {
      this.categoriesMargin = value;
    }
    else if (row === 4) {
      this.seriesMargin = value;
    }
  }

  restoreBottomMargin(pageState: any): void {
    if (pageState) {
      const value = pageState.bottomMargin;
      let elem = this.commonService.getElementById('contentRows');
      if (value && elem) {
        elem.style.bottom = value + 'px';
        this.bottomMargin = value;
      }
    }
  }

  showBusyLoaders(): void {
    this.commonService.showElementById('recommendedBusyLoader');
    this.commonService.showElementById('mostViewedBusyLoader');
    this.commonService.showElementById('newestBusyLoader');
    this.commonService.showElementById('categoriesBusyLoader');
    this.commonService.showElementById('seriesBusyLoader');
  }

  changeRowBackgroundColor(elementId: string, color: string): void {
    const element = this.commonService.getElementById(elementId);
    if (element) {
      element.style.backgroundColor = color;
    }
  }

  calculateItemWidth(): number {
    const width = this.commonService.getWindowWidth() - 80 - 40;
    return Math.round(width / 3.2);
  }

  calculateRowHeight(): number {
    const height = this.commonService.getWindowHeight() - 90 - 180;
    return Math.round(height / 2.5);
  }

  setRowHeightValues(): void {
    const rowHeight = this.calculateRowHeight();
    if (rowHeight) {
      let element = this.commonService.getElementById('recommendedProgramsContainer');
      if (element) {
        element.style.height = rowHeight + 'px';
      }

      element = this.commonService.getElementById('mostViewedProgramsContainer');
      if (element) {
        element.style.height = rowHeight + 'px';
      }

      element = this.commonService.getElementById('newestProgramsContainer');
      if (element) {
        element.style.height = rowHeight + 'px';
      }

      element = this.commonService.getElementById('categoriesContainer');
      if (element) {
        element.style.height = rowHeight + 'px';
      }

      element = this.commonService.getElementById('seriesContainer');
      if (element) {
        element.style.height = rowHeight + 'px';
      }
    }
  }

  toCategoryProgramsPage(category: any): void {
    if (category) {
      this.commonService.cacheValue(selectedCategoryKey, this.commonService.jsonToString(category));
      this.removeKeydownEventListener();
      this.commonService.toPage(categoryProgramsPage, archiveMainPage);
    }
  }

  toProgramInfoPage(row: number, col: number): void {
    const data = this.getProgramDataByRowAndCol(row, col);
    if (data) {
      this.savePageState(row, col);

      this.commonService.showElementById('commonBusyLoader');
      this.removeKeydownEventListener();

      this.archiveService.getProgramInfo(data.id, (program: any) => {
        if (program != null) {
          this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(program[0]));

          this.commonService.hideElementById('commonBusyLoader');
          this.commonService.toPage(programInfoPage, archiveMainPage);
        }
        else {
          this.commonService.hideElementById('commonBusyLoader');

          this.commonService.toPage(errorPage, null);
        }
      });
    }
  }

  toSeriesInfoPage(row: number, col: number): void {
    if (this.seriesData && this.seriesData[col]) {
      const { sid } = this.seriesData[col];

      this.savePageState(row, col);

      this.commonService.showElementById('commonBusyLoader');
      this.removeKeydownEventListener();

      this.archiveService.getSeriesInfo(sid, (series: any) => {
        if (series != null) {
          series = series[0];

          series = this.commonService.addSeriesProperties(series, sid);

          //console.log('Selected series: ', series);

          this.commonService.cacheValue(selectedArchiveSeriesKey, this.commonService.jsonToString(series));

          this.commonService.hideElementById('commonBusyLoader');
          this.commonService.toPage(seriesInfoPage, archiveMainPage);
        }
        else {
          this.commonService.hideElementById('commonBusyLoader');
          this.commonService.toPage(errorPage, null);
        }
      });
    }
  }

  readRecommendedPrograms(date: string, limit: number, offset: number, pageState: any): void {
    this.archiveService.getRecommendedPrograms(date, limit, offset, (data: any) => {
      if (data != null) {
        this.recommended = data;

        const itemWidth = this.calculateItemWidth() + 20;
        this.recommendedRowWidth = this.recommended.length * itemWidth;
        this.cdRef.detectChanges();

        //console.log('readRecommendedPrograms(): response: ', this.recommended);

        this.restoreRightMargin(pageState, 'recommendedPrograms', 0);

        this.commonService.hideElementById('recommendedBusyLoader');
        this.changeRowBackgroundColor('recommendedProgramsContainer', '#ffffff');

        setTimeout(() => {
          if (!pageState) {
            this.commonService.focusToElement(defaultRowCol);
          }
        });
      }
      else {
        this.commonService.hideElementById('recommendedBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(errorPage, null);
      }
    });
  }

  readMostViewedPrograms(archiveLanguage: string, pageState: any): void {
    this.archiveService.getMostViewedPrograms(archiveLanguage, (data: any) => {
      if (data !== null) {
        this.mostViewed = data;

        const itemWidth = this.calculateItemWidth() + 20;
        this.mostViewedRowWidth = this.mostViewed.length * itemWidth;
        this.cdRef.detectChanges();

        //console.log('readMostViewedPrograms(): response: ', this.mostViewed);

        this.restoreRightMargin(pageState, 'mostViewedPrograms', 1);

        this.commonService.hideElementById('mostViewedBusyLoader');
        this.changeRowBackgroundColor('mostViewedProgramsContainer', '#ffffff');
      }
      else {
        this.commonService.hideElementById('mostViewedBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(errorPage, null);
      }
    });
  }

  readNewestPrograms(date: string, limit: number, offset: number, category: string, pageState: any): void {
    this.archiveService.getNewestPrograms(date, limit, offset, category, (data: any) => {
      if (data !== null) {
        this.newest = data;

        const itemWidth = this.calculateItemWidth() + 20;
        this.newestRowWidth = this.newest.length * itemWidth;
        this.cdRef.detectChanges();

        //console.log('readNewestPrograms(): response: ', this.newest);

        this.restoreRightMargin(pageState, 'newestPrograms', 2);

        this.commonService.hideElementById('newestBusyLoader');
        this.changeRowBackgroundColor('newestProgramsContainer', '#ffffff');
      }
      else {
        this.commonService.hideElementById('newestBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(errorPage, null);
      }
    });
  }

  readParentCategories(pageState: any, pageLoad: boolean, cb: Function): void {
    this.archiveService.getParentCategories((data: any) => {
      if (data !== null) {
        this.categories = data;
        this.cdRef.detectChanges();

        const itemWidth = this.calculateItemWidth() + 20;
        this.categoriesRowWidth = this.categories.length * itemWidth;
        this.cdRef.detectChanges();

        //console.log('readParentCategories(): response: ', this.categories);

        if (pageLoad) {
          this.restoreRightMargin(pageState, 'categories', 3);

          this.commonService.hideElementById('categoriesBusyLoader');
          this.changeRowBackgroundColor('categoriesContainer', '#ffffff');
        }
        else {
          this.commonService.focusToElement(categoryDefaultRowCol);
        }

        this.subCategoriesVisible = false;

        if (cb) {
          cb(this.categories);
        }
      }
      else {
        this.commonService.hideElementById('categoriesBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(errorPage, null);
      }
    });
  }

  readSubCategories(pageState: any, pageLoad: boolean, cb: Function): void {

    this.archiveService.getSubCategories((data: any) => {
      if (data !== null) {
        if (!this.lastParentCategoryId && pageState) {
          this.lastParentCategoryId = pageState.lastParentCategoryId;
        }

        this.lastParentCategoryId = !this.lastParentCategoryId ? pageState.lastParentCategoryId : this.lastParentCategoryId;

        this.categories = this.archiveService.filterSubCategories(data, this.lastParentCategoryId);
        this.cdRef.detectChanges();

        //console.log('readSubCategories(): filtered response: ', this.categories);

        if (pageLoad) {
          this.restoreRightMargin(pageState, 'categories', 3);

          this.commonService.hideElementById('categoriesBusyLoader');
          this.changeRowBackgroundColor('categoriesContainer', '#ffffff');
        }
        else {
          if (cb) {
            cb(this.categories);
          }
        }

        this.subCategoriesVisible = true;

        setTimeout(() => {
          this.changeCategoriesTitleText(this.categories[0].parent_name);
          this.localeService.setLocaleText('categoryBackText');
        });
      }
      else {
        this.commonService.hideElementById('categoriesBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(errorPage, null);
      }
    });
  }

  readSeries(pageState: any): void {
    let yesterdayGuide: any = this.commonService.getValueFromCache(programScheduleYesterdayDataKey);
    if (!yesterdayGuide) {
      this.programScheduleService.getGuideByDate(this.commonService.getYesterdayDate(), (gd) => {
        if (gd !== null) {
          this.commonService.cacheValue(programScheduleYesterdayDataKey, this.commonService.jsonToString(gd.data));

          this.handleSeries(gd.data, pageState);
        }
        else {
          this.commonService.hideElementById('seriesBusyLoader');
          this.removeKeydownEventListener();

          this.commonService.toPage(errorPage, null);
        }
      });
    }
    else {
      console.log('**Return series data from cache.');
      this.handleSeries(this.commonService.stringToJson(yesterdayGuide), pageState);
    }
  }

  handleSeries(guide: any, pageState: any): void {
    if (guide) {
      guide = guide.concat(this.commonService.stringToJson(this.commonService.getValueFromCache(programScheduleDataKey)));

      this.seriesData = this.removeDuplicates(guide);
      if (this.seriesData) {
        this.cdRef.detectChanges();

        //console.log('Series data: ', this.seriesData);
        console.log('Series data length: ', this.seriesData.length);

        const itemWidth = this.calculateItemWidth() + 20;
        this.seriesRowWidth = this.seriesData.length * itemWidth;
        this.cdRef.detectChanges();

        this.restoreRightMargin(pageState, 'series', 4);

        this.commonService.hideElementById('seriesBusyLoader');
        this.changeRowBackgroundColor('seriesContainer', '#ffffff');
      }
    }
  }

  getCategoriesCount(): number {
    return this.categories.length;
  }

  changeCategoriesTitleText(text: string): void {
    if (text) {
      this.commonService.addToElement('categoriesText', text);
    }
  }

  restoreCategoriesTitleText(): void {
    const categoriesText = this.localeService.getLocaleTextById('categoriesText');
    if (categoriesText) {
      this.commonService.addToElement('categoriesText', categoriesText);
    }
  }

  removeDuplicates(guide: any): any {
    let seen = [];
    let retVal = [];
    for (let i = 0; i < guide.length; i++) {
      let { sid, episode_number, is_visible_on_vod, series, image_path, name_desc, localStartDate, duration_time } = guide[i];

      if (!this.validateValue(sid) || !this.validateValue(episode_number) || !this.validateValue(is_visible_on_vod)) {
        continue;
      }

      if (Number(episode_number) > 1 && is_visible_on_vod !== '-1' && seen.indexOf(sid) === -1) {
        retVal.push({ sid, series, image_path, name_desc, localStartDate, duration_time });
        seen.push(guide[i].sid);
      }
    }

    return retVal;
  }

  validateValue(value: string): boolean {
    return value && value !== '' && value !== nullValue;
  }
}
