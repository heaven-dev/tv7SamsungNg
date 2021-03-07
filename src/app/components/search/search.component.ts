import { Component, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { AppService } from '../../services/app.service';
import { LocaleService } from '../../services/locale.service';
import {
  tvMainPage,
  archiveMainPage,
  guidePage,
  searchPage,
  searchResultPage,
  keyboardNormal,
  keyboardCapital,
  keyboardSpecial,
  favoritesPage,
  platformInfoPage,
  errorPage,
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  defaultRowCol,
  searchPageStateKey,
  favoritesIconContainer,
  platformInfoIconContainer,
  clearKey,
  searchKey,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  RETURN,
  ESC
} from '../../helpers/constants';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit {

  keyboard: any = null;
  keyboardType: number = 1;

  row1Normal: any = null;
  row2Normal: any = null;
  row3Normal: any = null;

  row1Special: any = null;
  row2Special: any = null;
  row3Special: any = null;

  keyWidthAndHeight: number = 0;
  keyFontSize: number = 0;
  iconWidth: number = 0;

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private appService: AppService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.commonService.showElementById('toolbarContainer');
    this.commonService.showElementById('sidebar');

    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.toPage(errorPage, null);
    }

    this.commonService.showElementById('searchBusyLoader');

    this.appService.selectSidebarIcon(searchIconContainer);

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.keyWidthAndHeight = this.calculateKeyWidthAndHeight();
    this.keyFontSize = 70 / 100 * this.keyWidthAndHeight;
    this.iconWidth = 70 / 100 * this.keyWidthAndHeight;

    this.keyboard = this.localeService.getKeyboard();

    this.row1Normal = this.keyboard.letter['1'];
    this.row2Normal = this.keyboard.letter['2'];
    this.row3Normal = this.keyboard.letter['3'];

    this.row1Special = this.keyboard.special['1'];
    this.row2Special = this.keyboard.special['2'];
    this.row3Special = this.keyboard.special['3'];
  }

  ngAfterViewInit(): void {
    const pageState = this.commonService.getValueFromCache(searchPageStateKey);
    if (pageState) {
      this.restorePageState(pageState);
    }

    this.commonService.removeOriginPage();

    this.commonService.hideElementById('searchBusyLoader');

    this.setDefaultFocus();
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

    if (keyCode === LEFT) {
      // LEFT arrow
      if (col === 0) {
        this.commonService.focusToElement(searchIconContainer);
      }
      else if (contentId === clearKey) {
        if (this.commonService.elementExist(searchKey)) {
          this.commonService.focusToElement(searchKey);
        }
      }
      else {
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
        this.commonService.focusToElement(defaultRowCol);
      }
      else if (contentId === searchKey) {
        if (this.commonService.elementExist(clearKey)) {
          this.commonService.focusToElement(clearKey);
        }
      }
      else {
        const newCol = col + 1;
        const newFocus = row + '_' + newCol;
        if (this.commonService.elementExist(newFocus)) {
          this.commonService.focusToElement(newFocus);
        }
      }
    }
    else if (keyCode === UP) {
      // UP arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusUp(contentId);
      }
      else {
        if (contentId === searchKey || contentId === clearKey) {
          const newFocus = '2_0';
          if (this.commonService.elementExist(newFocus)) {
            this.commonService.focusToElement(newFocus);
          }
        }
        else {
          const newRow = row - 1;
          const newFocus = newRow + '_' + col;
          if (this.commonService.elementExist(newFocus)) {
            this.commonService.focusToElement(newFocus);
          }
        }
      }
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.menuFocusDown(contentId);
      }
      else {
        if (row === 2) {
          if (this.commonService.elementExist(searchKey)) {
            this.commonService.focusToElement(searchKey);
          }
        }
        else {
          const newRow = row + 1;
          let newFocus = newRow + '_' + col;
          if (this.commonService.elementExist(newFocus)) {
            this.commonService.focusToElement(newFocus);
          }
          else {
            newFocus = newRow + '_' + (--col);
            this.commonService.focusToElement(newFocus);
          }
        }
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
        || contentId === favoritesIconContainer || contentId === platformInfoIconContainer) {
        this.commonService.showElementById('searchBusyLoader');

        this.commonService.focusOutFromMenuEvent();
        this.removeKeydownEventListener();
      }

      if (contentId === searchIconContainer) {
        this.commonService.focusOutFromMenuEvent();
        this.commonService.focusToElement(defaultRowCol);
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
      else if (contentId === favoritesIconContainer) {
        this.commonService.sideMenuSelection(favoritesPage);
      }
      else if (contentId === platformInfoIconContainer) {
        this.commonService.sideMenuSelection(platformInfoPage);
      }
      else {
        this.itemSelected(e.target);
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.commonService.isSideBarMenuActive(contentId)) {
        this.commonService.focusOutFromMenuEvent();
        this.commonService.focusToElement(defaultRowCol);
      }
      else {
        //this.commonService.showElementById('searchBusyLoader');
        this.removeKeydownEventListener();

        this.commonService.toPage(archiveMainPage, null);
      }
    }
  }

  restorePageState(pageState: any): void {
    if (pageState) {
      pageState = this.commonService.stringToJson(pageState);

      let elem = this.commonService.getElementById('searchTextField');
      if (elem) {
        elem.value = pageState.searchText;
      }

      this.commonService.removeValueFromCache(searchPageStateKey);
    }
  }

  itemSelected(element: any): void {
    const searchTextField = this.commonService.getElementById('searchTextField');
    if (element && searchTextField) {
      //console.log('Selected item: ', element);

      let value = '';
      const key = element.getAttribute('key');
      if (key) {
        value = searchTextField.value;
        if (key === 'space') {
          value += ' ';
        }
        else if (key === 'backSpace') {
          if (value && value.length > 0) {
            value = value.slice(0, -1);
          }
        }
        else if (key === 'capslock') {
          this.keyboardType = this.keyboardType === keyboardCapital ? keyboardNormal : keyboardCapital;
          this.cdRef.detectChanges();
          this.setDefaultFocus();
        }
        else if (key === 'specialChars') {
          this.keyboardType = keyboardSpecial;
          this.cdRef.detectChanges();
          this.setDefaultFocus();
        }
        else if (key === 'letterChars') {
          this.keyboardType = keyboardNormal;
          this.cdRef.detectChanges();
          this.setDefaultFocus();
        }
        else if (key === 'clear') {
          value = '';
        }
        else if (key === 'search') {
          if (value && value.length > 0) {
            //console.log('Search text: ', value);

            this.removeKeydownEventListener();

            const pageState = {
              searchText: value
            };

            this.commonService.cacheValue(searchPageStateKey, this.commonService.jsonToString(pageState));
            this.commonService.toPage(searchResultPage, searchPage);
          }
          else {
            searchTextField.style.backgroundColor = '#fadbd8';
          }
        }
      }
      else {
        value = element.innerHTML;
        if (value === '&amp;') {
          value = '&';
        }
        else if (value === '&lt;') {
          value = '<';
        }
        else if (value === '&gt;') {
          value = '>';
        }

        value = searchTextField.value + value;
        searchTextField.style.backgroundColor = '#fafafa';
      }

      searchTextField.value = value;
    }
  }

  stringEndsWith(value: string, target: string): boolean {
    return value.substring(value.length - target.length) == target;
  }

  calculateKeyWidthAndHeight(): number {
    const width = (this.commonService.getWindowWidth() / 2.4) / 11;
    return width;
  }

  isLowerCase(): boolean {
    return this.keyboardType === keyboardNormal;
  }

  columnImageBtnIndex(col: number): number {
    let keyboard = this.localeService.getKeyboard();

    if (this.keyboardType === keyboardNormal || this.keyboardType === keyboardCapital) {
      return keyboard.letter['3'].length - 1 + col;
    }
    else {
      return keyboard.special['3'].length - 1 + col;
    }
  }

  getSearchText(): string {
    return this.localeService.getLocaleTextById('searchText');
  }

  getClearText(): string {
    return this.localeService.getLocaleTextById('clearText');
  }

  setDefaultFocus(): void {
    setTimeout(() => {
      this.commonService.focusToElement(defaultRowCol);
    });
  }
}
