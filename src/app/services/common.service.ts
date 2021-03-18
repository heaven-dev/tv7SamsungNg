import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  tvIconContainer,
  archiveIconContainer,
  guideIconContainer,
  searchIconContainer,
  favoritesIconContainer,
  channelInfoIconContainer,
  platformInfoIconContainer,
  runOnBrowser,
  archivePageStateKey,
  searchResultPageStateKey,
  categoriesPageStateKey,
  seriesPageStateKey,
  guidePageStateKey,
  searchPageStateKey,
  favoritesPageStateKey,
  originPageKey,
  visiblePageKey,
  errorTextKey,
  noNetworkConnectionText
} from '../helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private router: Router) { }

  getTodayDate(): string {
    const d = new Date();

    return d.getFullYear() + '-' + this.prependZero((d.getMonth() + 1)) + '-' + this.prependZero(d.getDate());
  }

  getTomorrowDate(): string {
    const d = new Date();

    d.setDate(d.getDate() + 1);
    return d.getFullYear() + '-' + this.prependZero((d.getMonth() + 1)) + '-' + this.prependZero(d.getDate());
  }

  getLocalDateByUtcTimestamp(time: number): any {
    return new Date(time);
  }

  prependZero(value: any): string {
    return Number(value) < 10 ? '0' + Number(value) : String(value);
  }

  isPastTime(time: number): boolean {
    const now = new Date().getTime();
    return now > time;
  }

  stringToJson(data: string): any {
    return JSON.parse(data);
  }

  jsonToString(data: any): string {
    return JSON.stringify(data);
  }

  getTimeStampByDuration(duration: number): string {
    if (duration) {
      let h, m, s;
      h = this.prependZero(Math.floor(duration / 1000 / 60 / 60));
      m = this.prependZero(Math.floor((duration / 1000 / 60 / 60 - h) * 60));
      s = this.prependZero(Math.floor(((duration / 1000 / 60 / 60 - h) * 60 - m) * 60));
      return h + ':' + m + ':' + s;
    }
    else {
      return '00:00:00';
    }
  }

  getElementByClass(element, className): any {
    return element.querySelector('.' + className);
  }

  getElementsByClass(element, className): any {
    return element.querySelectorAll('.' + className);
  }

  getElementById(id): any {
    return document.getElementById(id);
  }

  showElement(element: any): void {
    if (element) {
      element.style.display = 'block';
    }
  }

  hideElement(element: any): void {
    if (element) {
      element.style.display = 'none';
    }
  }

  showElementById(elementId: string): void {
    if (elementId) {
      this.showElement(this.getElementById(elementId));
    }
  }

  hideElementById(elementId: string): void {
    if (elementId) {
      this.hideElement(this.getElementById(elementId));
    }
  }

  getWindowWidth(): number {
    return window.document.documentElement.clientWidth;
  }

  getWindowHeight(): number {
    return window.document.documentElement.clientHeight;
  }

  getDateByTimeInMs(time: number): string {
    if (time) {
      const d = new Date(time);
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
    }
    else {
      return '-';
    }
  }

  getDateTimeByTimeInMs(time: number): string {
    if (time) {
      const d = new Date(time);
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
        + '  ' + this.prependZero(d.getHours()) + ':' + this.prependZero(d.getMinutes());
    }
    else {
      return '-';
    }
  }

  focusOutFromMenuEvent(): void {
    const tvIconText = this.getElementById('tvIconText');
    if (tvIconText) {
      this.hideElement(tvIconText);
    }

    const archiveIconText = this.getElementById('archiveIconText');
    if (archiveIconText) {
      this.hideElement(archiveIconText);
    }

    const guideIconText = this.getElementById('guideIconText');
    if (guideIconText) {
      this.hideElement(guideIconText);
    }

    const searchIconText = this.getElementById('searchIconText');
    if (searchIconText) {
      this.hideElement(searchIconText);
    }

    const favoritesIconText = this.getElementById('favoritesIconText');
    if (favoritesIconText) {
      this.hideElement(favoritesIconText);
    }

    const channelInfoIconText = this.getElementById('channelInfoIconText');
    if (channelInfoIconText) {
      this.hideElement(channelInfoIconText);
    }

    const platformInfoIconText = this.getElementById('platformInfoIconText');
    if (platformInfoIconText) {
      this.hideElement(platformInfoIconText);
    }
  }

  menuFocusUp(contentId: string): void {
    if (contentId === platformInfoIconContainer) {
      this.focusToElement(channelInfoIconContainer);
    }
    else if (contentId === channelInfoIconContainer) {
      this.focusToElement(favoritesIconContainer);
    }
    else if (contentId === favoritesIconContainer) {
      this.focusToElement(searchIconContainer);
    }
    else if (contentId === searchIconContainer) {
      this.focusToElement(guideIconContainer);
    }
    else if (contentId === guideIconContainer) {
      this.focusToElement(archiveIconContainer);
    }
    else if (contentId === archiveIconContainer) {
      this.focusToElement(tvIconContainer);
    }
  }

  menuFocusDown(contentId: string): void {
    if (contentId === tvIconContainer) {
      this.focusToElement(archiveIconContainer);
    }
    else if (contentId === archiveIconContainer) {
      this.focusToElement(guideIconContainer);
    }
    else if (contentId === guideIconContainer) {
      this.focusToElement(searchIconContainer);
    }
    else if (contentId === searchIconContainer) {
      this.focusToElement(favoritesIconContainer);
    }
    else if (contentId === favoritesIconContainer) {
      this.focusToElement(channelInfoIconContainer);
    }
    else if (contentId === channelInfoIconContainer) {
      this.focusToElement(platformInfoIconContainer);
    }
  }

  cacheValue(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  getValueFromCache(key: string): string {
    return sessionStorage.getItem(key);
  }

  removeValueFromCache(key: string): void {
    sessionStorage.removeItem(key);
  }

  saveValue(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getSavedValue(key: string): string {
    return localStorage.getItem(key);
  }

  removeSavedValue(key: string): void {
    localStorage.removeItem(key);
  }

  focusToElement(id: string): void {
    if (id) {
      const elem = this.getElementById(id);
      if (elem) {
        elem.focus();
      }
    }
  }

  isSideBarMenuActive(contentId: string): boolean {
    return contentId === tvIconContainer || contentId === archiveIconContainer || contentId === guideIconContainer
      || contentId === searchIconContainer || contentId === favoritesIconContainer || contentId === channelInfoIconContainer
      || contentId === platformInfoIconContainer;
  }

  addToElement(elementId: string, value: any): void {
    let element = this.getElementById(elementId);
    if (element) {
      element.innerHTML = value;
    }
  }

  addValueToAttribute(elementId: string, attribute: string, value: any): void {
    let element = this.getElementById(elementId);
    if (element && attribute && value) {
      element.setAttribute(attribute, value);
    }
  }

  isConnectedToGateway(): any {
    if (!runOnBrowser) {
      // @ts-ignore
      let isConnected = webapis.network.isConnectedToGateway();
      if (!isConnected) {
        this.cacheValue(errorTextKey, noNetworkConnectionText);
      }

      return isConnected;
    }
    else {
      if (navigator) {
        return navigator.onLine;
      }

      return true;
    }
  }

  elementExist(element: string): boolean {
    const elem = this.getElementById(element);
    return elem ? true : false;
  }

  removeOriginPage(): void {
    this.removeValueFromCache(originPageKey);
  }

  getOriginPage(): string {
    let page = null;

    let value: any = this.getValueFromCache(originPageKey);
    if (value) {
      value = this.stringToJson(value);
      if (value && value.length > 0) {
        page = value.shift();
        this.cacheValue(originPageKey, this.jsonToString(value));
      }
    }

    return page;
  }

  setOriginPage(page: string): void {
    let value: any = this.getValueFromCache(originPageKey);
    value = value ? this.stringToJson(value) : [];
    value.unshift(page);
    this.cacheValue(originPageKey, this.jsonToString(value));
  }

  toPage(toPage: string, fromPage: string): void {
    if (fromPage) {
      this.setOriginPage(fromPage);
    }

    this.cacheValue(visiblePageKey, toPage);
    this.router.navigate([toPage]);
  }

  toPreviousPage(alternativePage: string): void {
    let page = this.getOriginPage();
    if (!page) {
      page = alternativePage;
    }

    this.toPage(page, null);
  }

  sideMenuSelection(page: string): void {
    this.deletePageStates();
    this.removeOriginPage();
    this.toPage(page, null);
  }

  deletePageStates(): void {
    this.removeValueFromCache(archivePageStateKey);
    this.removeValueFromCache(searchResultPageStateKey);
    this.removeValueFromCache(categoriesPageStateKey);
    this.removeValueFromCache(seriesPageStateKey);
    this.removeValueFromCache(guidePageStateKey);
    this.removeValueFromCache(searchPageStateKey);
    this.removeValueFromCache(favoritesPageStateKey);
  }

  screenSaverOn(): void {
    if (!runOnBrowser) {
      // @ts-ignore
      webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON, () => { });
    }
  }

  screenSaverOff(): void {
    if (!runOnBrowser) {
      // @ts-ignore
      webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF, () => { });
    }
  }
}
