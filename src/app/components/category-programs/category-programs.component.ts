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
  selectedCategoryKey,
  categoriesPageStateKey,
  selectedArchiveProgramKey,
  nullValue,
  errorPage,
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
  selector: 'app-category-programs',
  templateUrl: './category-programs.component.html',
  styleUrls: ['./category-programs.component.css']
})
export class CategoryProgramsComponent implements OnInit, AfterViewInit {

  selectedCategory: any = null;
  limit: number = 16;
  offset: number = 0;
  categoryProgramData: any = [];
  loadingData: boolean = false;
  animationOngoing: boolean = false;

  rowImageWidth: number = 0;
  rowItemHeight: number = 0;
  rowIndex: number = 0;
  lastContentRowId: string = '';

  bottomMargin: number = 0;

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

    this.appService.selectSidebarIcon(archiveIconContainer);

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.rowImageWidth = this.calculateImageWidth();
    this.rowItemHeight = this.calculateRowHeight();
  }

  ngAfterViewInit(): void {
    const pageState = this.getPageState();

    this.selectedCategory = this.commonService.stringToJson(this.commonService.getValueFromCache(selectedCategoryKey));
    if (this.selectedCategory) {
      this.updateProperties();

      //console.log('Selected category: ', selectedCategory);

      this.commonService.addToElement('categoryText', this.localeService.getLocaleTextById('categoryText') + ': ' + this.selectedCategory.name);

      if (pageState) {
        //console.log('**Restore categories data from cache.');
        this.restorePageState(pageState);
      }
      else {
        this.getCategoryProgramsData('0_c');
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

          if (row > 0 && this.offset > 0 && row + this.limit / 2 === this.categoryProgramData.length) {
            this.getCategoryProgramsData(newFocus);
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
        this.commonService.showElementById('categoryProgramsBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (contentId === archiveIconContainer) {
        this.commonService.sideMenuSelection(archiveMainPage);
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
      else if (contentId === platformInfoIconContainer) {
        this.commonService.sideMenuSelection(platformInfoPage);
      }
      else {
        if (this.categoryProgramData && this.categoryProgramData[row]) {
          this.savePageState(row);

          this.removeKeydownEventListener();

          if (this.categoryProgramData[row].sid) {
            this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(this.categoryProgramData[row]));
            this.commonService.toPage(seriesProgramsPage, categoryProgramsPage);
          }
          else {
            this.commonService.showElementById('categoryProgramsBusyLoader');
            this.removeKeydownEventListener();

            const isConnected = this.commonService.isConnectedToGateway();
            if (!isConnected) {
              this.commonService.hideElementById('categoryProgramsBusyLoader');
              this.commonService.toPage(errorPage, null);
            }
            else {
              this.archiveService.getProgramInfo(this.categoryProgramData[row].id, (program: any) => {
                this.commonService.cacheValue(selectedArchiveProgramKey, this.commonService.jsonToString(program[0]));

                this.commonService.hideElementById('categoryProgramsBusyLoader');

                this.commonService.toPage(programInfoPage, categoryProgramsPage);
              });
            }
          }
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
        //this.commonService.showElementById('categoryProgramsBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPreviousPage(archiveMainPage);
      }
    }
  }

  rowMoveDownUp(row: number, down: boolean): void {
    const element = this.commonService.getElementById('categoryProgramsContainer');
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

  updateProperties(): void {
    if (this.selectedCategory.parent_id) {
      this.selectedCategory.id = this.selectedCategory.category_id;

      if (this.selectedCategory.category_name !== this.selectedCategory.parent_name) {
        this.selectedCategory.name = this.selectedCategory.parent_name + ' | ' + this.selectedCategory.category_name;
      }
      else {
        this.selectedCategory.name = this.selectedCategory.category_name;
      }
    }
  }

  getCategoryProgramsData(focusElement: string): void {
    this.loadingData = true;
    this.commonService.showElementById('categoryProgramsBusyLoader');

    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.hideElementById('categoryProgramsBusyLoader');
      this.removeKeydownEventListener();

      this.commonService.toPage(errorPage, null);
    }
    else {
      this.archiveService.getCategoryPrograms(this.selectedCategory.id, this.limit, this.offset, (data: any) => {
        this.categoryProgramData = this.categoryProgramData.concat(data);
        this.cdRef.detectChanges();

        //console.log('Category programs data: ', categoryProgramData);

        if (data) {
          if (data.length < this.limit) {
            this.limit = -1;
            this.offset = -1;
          }
          else {
            this.offset = this.offset + data.length;
          }
        }

        setTimeout(() => {
          this.commonService.hideElementById('categoryProgramsBusyLoader');
          this.commonService.focusToElement(focusElement);
          this.loadingData = false;
        });
      });
    }
  }

  getPageState(): any {
    const value = this.commonService.getValueFromCache(categoriesPageStateKey);
    if (value) {
      return this.commonService.stringToJson(value);
    }
    return null;
  }

  savePageState(row: number): void {
    const pageState = {
      row: row,
      bottomMargin: this.bottomMargin,
      categoryProgramData: this.commonService.jsonToString(this.categoryProgramData),
      limit: this.limit,
      offset: this.offset
    }

    this.commonService.cacheValue(categoriesPageStateKey, this.commonService.jsonToString(pageState));
  }

  deletePageState(): void {
    this.commonService.removeValueFromCache(categoriesPageStateKey);
  }

  restorePageState(ps: any): void {
    if (ps) {
      this.commonService.showElementById('categoryProgramsBusyLoader');

      this.bottomMargin = ps.bottomMargin;
      let element = this.commonService.getElementById('categoryProgramsContainer');
      if (element) {
        element.style.bottom = this.bottomMargin + 'px';
      }

      this.categoryProgramData = this.commonService.stringToJson(ps.categoryProgramData);
      this.cdRef.detectChanges();

      this.limit = ps.limit;
      this.offset = ps.offset;

      this.deletePageState();

      setTimeout(() => {
        this.commonService.hideElementById('categoryProgramsBusyLoader');
        const focusRow = ps.row + '_c';
        this.commonService.focusToElement(focusRow);
      });
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

  isSeries(sid: any): boolean {
    return sid && sid !== '' && sid !== nullValue;
  }
}
