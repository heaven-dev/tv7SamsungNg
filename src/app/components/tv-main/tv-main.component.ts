import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';

import { AppService } from '../../services/app.service';
import { CommonService } from '../../services/common.service';
import { ProgramScheduleService } from '../../services/program-schedule.service';
import { LocaleService } from '../../services/locale.service';

import {
  runOnBrowser,
  tvMainPage,
  tvPlayerPage,
  archiveMainPage,
  guidePage,
  favoritesPage,
  platformInfoPage,
  searchPage,
  toolbarHeight,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  platformInfoIconContainer,
  programScheduleDataKey,
  playButton,
  mainPageUpdateInterval,
  programListMinSize,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC,
  exitCancelButton,
  exitYesButton,
  upDownIcon
} from '../../helpers/constants';

@Component({
  selector: 'app-tvmain',
  templateUrl: './tv-main.component.html',
  styleUrls: ['./tv-main.component.css']
})
export class TvMainComponent implements OnInit, AfterViewInit {
  mainViewHeight: string = '';
  guideData: any = null;
  guideIndex: number = 0;
  guideDataCount: number = 10;
  guideRowHeight: number = 0;
  programsCount: number = 11;

  programStartTime: number = 0;
  interval: any = null;
  modalVisible: boolean = false;

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private appService: AppService,
    private commonService: CommonService,
    private programScheduleService: ProgramScheduleService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    this.appService.selectSidebarIcon(tvIconContainer);

    this.mainViewHeight = (this.commonService.getWindowHeight() - toolbarHeight - 40) + 'px';

    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.showElementById('noNetworkConnection');
      return;
    }

    this.commonService.removeOriginPage();

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.localeService.setLocaleText('nextProgramsText');

      const guideContainer = this.commonService.getElementById('guideContainer');
      if (guideContainer) {
        this.guideRowHeight = (guideContainer.offsetHeight - 32) / this.guideDataCount;
      }

      this.guideData = this.commonService.getValueFromCache(programScheduleDataKey);
      if (this.guideData) {
        this.guideData = JSON.parse(this.guideData);
        //console.log('Program count: ', guideData.length);
      }

      this.updatePage(false);

      this.commonService.focusToElement(playButton);

      this.addInterval();
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

    //console.log('Key code : ', keyCode);

    if (keyCode === LEFT) {
      // LEFT arrow
      if (this.modalVisible) {
        if (contentId === exitCancelButton) {
          this.commonService.focusToElement(exitYesButton);
        }
      }
      else {
        if (contentId === upDownIcon) {
          this.commonService.focusToElement(playButton);
        }
        else if (contentId === playButton) {
          this.commonService.focusToElement(tvIconContainer);
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
        if (contentId === playButton) {
          this.commonService.focusToElement(upDownIcon);
        }
        else if (this.commonService.isSideBarMenuActive(contentId)) {
          this.commonService.focusToElement(playButton);
        }
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (!this.modalVisible) {
        if (contentId === upDownIcon && this.guideIndex > 0 && !this.programScheduleService.isOngoingProgram(this.guideData, this.guideIndex)) {
          this.guideIndex--;
          this.updateGuide(this.programScheduleService.getGuideData(this.guideData, this.guideIndex, this.guideDataCount));
        }
        else if (this.commonService.isSideBarMenuActive(contentId)) {
          this.commonService.menuFocusUp(contentId);
        }
      }
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      if (!this.modalVisible) {
        if (contentId === upDownIcon && this.programScheduleService.isInIndex(this.guideData, this.guideIndex + this.guideDataCount)) {
          this.guideIndex++;
          this.updateGuide(this.programScheduleService.getGuideData(this.guideData, this.guideIndex, this.guideDataCount));
        }
        else if (this.commonService.isSideBarMenuActive(contentId)) {
          this.commonService.menuFocusDown(contentId);
        }
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (!this.modalVisible) {
        if (contentId === archiveIconContainer || contentId === guideIconContainer || contentId === searchIconContainer
          || contentId === favoritesIconContainer || contentId === platformInfoIconContainer) {
          this.commonService.showElementById('tvMainBusyLoader');
          this.commonService.focusOutFromMenuEvent();

          this.removeKeydownEventListener();
          this.stopInterval();
        }

        if (contentId === playButton) {
          this.stopInterval();

          this.commonService.hideElementById('toolbarContainer');
          this.commonService.hideElementById('sidebar');

          this.removeKeydownEventListener();

          // open tv-palyer page
          this.commonService.toPage(tvPlayerPage, tvMainPage);
        }
        else if (contentId === tvIconContainer) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement(playButton);
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
      else {
        if (contentId === exitYesButton) {
          // yes selected => exit from application
          this.stopInterval();

          if (!runOnBrowser) {
            // @ts-ignore
            tizen.application.getCurrentApplication().exit();
          }
        }
        else {
          // cancel selected => to main view
          this.commonService.hideElementById('exitModal');
          this.commonService.focusToElement(playButton);

          this.modalVisible = false;
        }
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (!this.modalVisible) {
        if (this.commonService.isSideBarMenuActive(contentId)) {
          this.commonService.focusOutFromMenuEvent();
          this.commonService.focusToElement(playButton);
        }
        else {
          this.commonService.showElementById('exitModal');
          this.commonService.focusToElement(exitYesButton);

          this.modalVisible = true;
        }
      }
      else {
        this.commonService.hideElementById('exitModal');
        this.commonService.focusToElement(playButton);

        this.modalVisible = false;
      }
    }
  }

  addInterval(): void {
    // Update content at specific interval
    this.interval = setInterval(() => {
      this.refreshData();
      this.updatePage(true);
    }, mainPageUpdateInterval);
  }

  stopInterval(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  refreshData(): void {
    if (!this.guideData) {
      return;
    }

    const count = this.guideData.length - this.programScheduleService.getOngoingProgramIndex(this.guideData);
    if (count <= programListMinSize) {
      // get today and tomorrow guide and update the page
      this.programScheduleService.getGuideByDate(this.commonService.getTodayDate(), (gToday) => {
        gToday = gToday.data;

        this.programScheduleService.getGuideByDate(this.commonService.getTomorrowDate(), (gTomorrow) => {
          this.guideData = gToday.concat(gTomorrow.data);

          this.commonService.cacheValue(programScheduleDataKey, this.commonService.jsonToString(this.guideData));

          this.updatePage(true);
        });
      });
    }
  }

  updatePage(fromTimer: boolean): void {
    //console.log('Update page.');

    const programs = this.programScheduleService.getOngoingAndComingPrograms(this.guideData, this.programsCount);

    //console.log('Programs data: ', programs);

    if (programs && programs.length === this.programsCount) {
      const program = programs[0];

      const startTime = program.time;

      if (startTime === this.programStartTime) {
        // update only status bar
        //console.log('Update only status bar.');

        let elem = this.commonService.getElementById('statusBar');
        if (elem) {
          elem.style.width = program.passedPercent + '%';
        }
      }
      else {
        // update images, texts guide, and status bar
        //console.log('Update images, texts and status bar.');

        let elem = this.commonService.getElementById('contentImage');
        if (elem) {
          elem.src = program.image_path;
          this.commonService.showElement(elem);
        }

        elem = this.commonService.getElementById('statusBar');
        if (elem) {
          elem.style.width = program.passedPercent + '%';
        }

        let descText = program.localStartTime;
        if (program.series) {
          descText += (' ' + program.series);

          if (program.name) {
            descText += (' | ' + program.name);
          }
        }
        else {
          descText += (' ' + program.name);
        }

        this.commonService.addToElement('descText', descText);

        // Next programs
        let row = 1;
        let col = 1
        for (let i = 1; i < this.programsCount; i++) {
          let elemIdImg = 'nextProgramsImg';
          let elemIdDesc = 'nextProgramsDesc';

          if (i === 6) {
            row = 2;
            col = 1;
          }

          elemIdImg += String(row) + String(col);
          elemIdDesc += String(row) + String(col);

          elem = this.commonService.getElementById(elemIdImg);
          if (elem) {
            elem.src = programs[i].image_path;
          }

          if (programs[i].series) {
            this.commonService.addToElement(elemIdDesc, programs[i].localStartTime + ' ' + programs[i].series);
          }
          else {
            this.commonService.addToElement(elemIdDesc, programs[i].localStartTime + ' ' + programs[i].name);
          }

          col++;
        }

        if (!fromTimer) {
          this.updateGuide(this.programScheduleService.getGuideData(this.guideData, this.guideIndex, this.guideDataCount));
        }
        else {
          if (this.guideIndex === 0) {
            this.updateGuide(this.programScheduleService.getGuideData(this.guideData, this.guideIndex, this.guideDataCount));
          }
          else {
            this.guideIndex--;
          }
        }

        // cache new program start time
        this.programStartTime = program.time;
      }
    }
  }

  updateGuide(data: any): void {
    //console.log('updateGuide(): ', data);

    if (data && data.length === this.guideDataCount) {
      //console.log('tvGuideData: height of tvGuideData: ', guideRowHeight);

      const elements = this.commonService.getElementsByClass(document, 'guideRow');
      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          let e = elements.item(i);
          e.style.maxHeight = this.guideRowHeight + 'px';
          e.style.lineHeight = this.guideRowHeight + 'px';
          e.style.fontSize = (this.guideRowHeight - 4) + 'px';
        }

        // date row text
        const row = data[0];
        if (row) {
          this.commonService.addToElement('dateElem', row.isStartDateToday ? this.localeService.getLocaleTextById('dateElem') : row.localStartDate);
        }

        // other rows
        for (let i = 1; i <= this.guideDataCount; i++) {
          let row = data[i - 1];
          if (row) {
            let time = 'time' + i;
            let nameTitle = 'nameTitle' + i;
            let nameDesc = 'nameDesc' + i;
            let nameDescCol = 'nameDescCol' + i;

            this.commonService.addToElement(time, row.localStartTime);
            if (row.series) {
              this.commonService.addToElement(nameTitle, row.series);
              this.commonService.addToElement(nameDesc, row.name && row.name.length > 0 ? ' | ' + row.name : '');
            }
            else {
              this.commonService.addToElement(nameTitle, row.name);
              this.commonService.addToElement(nameDesc, '');
            }

            // calculate and set name desc element width
            let timeElemWidth = this.commonService.getElementById(time).clientWidth;
            if (timeElemWidth) {
              let nameDescColElem = this.commonService.getElementById(nameDescCol);
              if (nameDescColElem) {
                nameDescColElem.style.width = 'calc(100% - ' + (timeElemWidth + 32) + 'px)';
              }
            }
          }
        }
      }
    }
  }
}
