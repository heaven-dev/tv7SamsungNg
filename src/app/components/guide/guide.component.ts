import { Component, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { AppService } from '../../services/app.service';
import { LocaleService } from '../../services/locale.service';
import { ProgramScheduleService } from '../../services/program-schedule.service';
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
  guidePageStateKey,
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
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit, AfterViewInit {

  dates: any = [];
  lastContentRowId: string = null;
  rowImageWidth: number = 0;
  rowItemHeight: number = 0;

  animationOngoing: boolean = false;
  bottomMargin: number = 0;
  selectedDate = null;
  selectedDateIndex: number = 0;
  guideDateData: any = null;

  ongoingProgramIndex = 0;

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private appService: AppService,
    private localeService: LocaleService,
    private programScheduleService: ProgramScheduleService,
    private archiveService: ArchiveService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(guideIconContainer);

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.rowImageWidth = this.calculateImageWidth();
    this.rowItemHeight = this.calculateRowHeight();
  }

  ngAfterViewInit(): void {
    this.addDates();

    const pageState = this.getPageState();
    if (pageState) {
      //console.log('**Restore series data from cache.');
      this.restorePageState(pageState);
    }
    else {
      this.addProgramGuide(this.dates[0].date, 0, true);
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

    let row: any = '';
    let col: any = '';
    let split = contentId.split('_');

    if (split && split.length === 2) {
      if (split[0] === 'r') {
        row = split[0];
        col = parseInt(split[1]);
      }
      else if (split[1] === 'c') {
        row = parseInt(split[0]);
        col = split[1];
      }

      this.lastContentRowId = contentId;
    }

    e.preventDefault();

    if (keyCode === LEFT) {
      // LEFT arrow
      if (contentId === 'r_0' || col === 'c') {
        this.commonService.focusToElement(guideIconContainer);
      }
      else if (row === 'r') {
        const newCol = col - 1;
        const newFocus = row + '_' + newCol;
        if (this.commonService.elementExist(newFocus)) {
          this.commonService.focusToElement(newFocus);
        }
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow			
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusToElement(this.lastContentRowId);
      }
      else if (row === 'r') {
        const newCol = col + 1;
        const newFocus = row + '_' + newCol;
        if (this.commonService.elementExist(newFocus)) {
          this.commonService.focusToElement(newFocus);
        }
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (!this.commonService.isSideBarMenuActive(contentId)) {
        var selDateId = 'r_' + this.selectedDateIndex;

        if (this.isDateToday(this.selectedDate) && row === this.ongoingProgramIndex) {
          this.commonService.focusToElement(selDateId);
        }
        else {
          const newRow = row - 1;
          const newFocus = newRow + '_' + col;
          if (this.commonService.elementExist(newFocus)) {
            if (!this.animationOngoing) {
              this.animationOngoing = true;

              this.rowMoveDownUp(row, false);
              this.commonService.focusToElement(newFocus);
            }
          }
          else {
            this.commonService.focusToElement(selDateId);
          }
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
        if (this.commonService.elementExist(newFocus)) {
          if (!this.animationOngoing) {
            this.animationOngoing = true;

            this.rowMoveDownUp(row, true);
            this.commonService.focusToElement(newFocus);
          }
        }
        else if (row === 'r') {
          if (this.isDateToday(this.selectedDate)) {
            const newRow = this.ongoingProgramIndex + '_c';
            this.commonService.focusToElement(newRow);
          }
          else {
            this.commonService.focusToElement('0_c');
          }
        }
      }
      else {
        this.commonService.menuFocusDown(contentId);
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === tvIconContainer || contentId === archiveIconContainer || contentId === searchIconContainer
        || contentId === favoritesIconContainer || contentId === platformInfoIconContainer) {
        this.commonService.showElementById('guideBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (this.commonService.isSideBarMenuActive(contentId)) {
        if (contentId === guideIconContainer) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement(this.lastContentRowId);
        }
        else if (contentId === tvIconContainer) {
          this.commonService.sideMenuSelection(tvMainPage);
        }
        else if (contentId === archiveIconContainer) {
          this.commonService.sideMenuSelection(archiveMainPage);
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
      else {
        if (contentId.indexOf('r_') !== -1) {
          this.bottomMargin = 0;
          this.addProgramGuide(this.dates[col].date, col, false);
        }
        else if (contentId.indexOf('_c') !== -1) {
          this.commonService.showElementById('guideBusyLoader');
          this.removeKeydownEventListener();

          this.archiveService.getProgramInfo(this.guideDateData[row].id, (program: any) => {
            if (program !== null) {
              this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(program[0]));

              this.savePageState(row);

              this.commonService.hideElementById('guideBusyLoader');

              this.commonService.toPage(programInfoPage, guidePage);
            }
            else {
              this.commonService.hideElementById('guideBusyLoader');
              this.commonService.toPage(errorPage, null);
            }
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
        //this.commonService.showElementById('guideBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(archiveMainPage, null);
      }
    }
  }

  rowMoveDownUp(row: number, down: boolean): void {
    const element = this.commonService.getElementById('guideContainer');
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

  addDates(): void {
    this.createDates();

    setTimeout(() => {
      this.commonService.focusToElement('r_0');
    });
  }

  addProgramGuide(date: string, col: number, firstLoad: boolean): void {
    this.selectedDate = date;

    this.commonService.showElementById('guideBusyLoader');

    this.programScheduleService.getGuideByDate(date, (guideData: any) => {
      if (guideData !== null) {
        //console.log('Guide by date data: ', guideData);

        this.guideDateData = guideData.data;
        this.cdRef.detectChanges();

        this.selectDate(col);
        this.selectedDateIndex = col;

        const element = this.commonService.getElementById('guideContainer');
        if (element && this.isDateToday(date)) {
          this.ongoingProgramIndex = guideData.ongoingProgramIndex;
          this.setTodayPosition(element, this.ongoingProgramIndex);
          this.commonService.showElementById('ongoingProgram_' + this.ongoingProgramIndex);
        }
        else {
          element.style.bottom = '0px';
        }

        if (element && !firstLoad) {
          this.animateRows(element);
        }

        this.commonService.hideElementById('guideBusyLoader');
      }
      else {
        this.commonService.hideElementById('guideBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(errorPage, null);
      }
    });
  }

  getPageState(): any {
    const value = this.commonService.getValueFromCache(guidePageStateKey);
    if (value) {
      return this.commonService.stringToJson(value);
    }
    return null;
  }

  savePageState(row: number): void {
    const pageState = {
      selectedDateIndex: this.selectedDateIndex,
      selectedDate: this.selectedDate,
      ongoingProgramIndex: this.ongoingProgramIndex,
      row: row,
      bottomMargin: this.bottomMargin,
      guideDateData: this.commonService.jsonToString(this.guideDateData)
    }

    this.commonService.cacheValue(guidePageStateKey, this.commonService.jsonToString(pageState));
  }

  deletePageState(): void {
    this.commonService.removeValueFromCache(guidePageStateKey);
  }

  restorePageState(ps: any): void {
    if (ps) {
      this.commonService.showElementById('guideBusyLoader');

      this.bottomMargin = ps.bottomMargin;
      let element = this.commonService.getElementById('guideContainer');
      if (element) {
        element.style.bottom = this.bottomMargin + 'px';
      }

      this.guideDateData = this.commonService.stringToJson(ps.guideDateData);
      this.cdRef.detectChanges();

      this.selectedDateIndex = ps.selectedDateIndex;
      this.selectDate(this.selectedDateIndex);

      this.selectedDate = ps.selectedDate;

      this.ongoingProgramIndex = ps.ongoingProgramIndex;

      this.deletePageState();

      setTimeout(() => {
        const focusRow = ps.row + '_c';
        this.commonService.focusToElement(focusRow);

        if (this.selectedDateIndex === 0) {
          this.commonService.showElementById('ongoingProgram_' + this.ongoingProgramIndex);
        }
      })

      this.commonService.hideElementById('guideBusyLoader');
    }
  }

  setTodayPosition(element: any, programIndex: number): void {
    this.bottomMargin = (this.calculateRowHeight() + 40) * (programIndex - 1);
    element.style.bottom = this.bottomMargin + 'px';
  }

  animateRows(element: any): void {
    element.classList.add('rowAnimationFadeIn');
    setTimeout(function () {
      element.classList.remove('rowAnimationFadeIn');
    }, 900);
  }

  selectDate(col: number): void {
    for (let i = 0; i < this.dates.length; i++) {
      let element = this.commonService.getElementById('r_' + i);
      if (element) {
        i === col ? element.classList.add('dateItemSelected') : element.classList.remove('dateItemSelected');
      }
    }
  }

  isDateToday(date: string): boolean {
    return date === this.commonService.getTodayDate();
  }

  createDates(): void {
    this.dates.length = 0;
    let d = Date.now();

    for (let i = 0; i < 7; i++) {
      this.dates.push(this.getDatesByTime(d, i));

      let date = new Date(d);
      date.setDate(date.getDate() + 1);
      d = date.getTime();
    }
  }

  getDatesByTime(time: number, index: number): any {
    const d = new Date(time);

    const date = d.getFullYear() + '-' + this.commonService.prependZero(d.getMonth() + 1) + '-' + this.commonService.prependZero(d.getDate());
    const label = index > 0 ? d.getDate() + '.' + (d.getMonth() + 1) + '.' : this.localeService.getLocaleTextById('dateElem');

    return { date: date, label: label };
  }

  calculateImageWidth(): number {
    const height = this.calculateRowHeight();
    return Math.round(height / 0.56);
  }

  calculateRowHeight(): number {
    const height = this.commonService.getWindowHeight() - 350;
    return Math.round(height / 3.5);
  }
}
