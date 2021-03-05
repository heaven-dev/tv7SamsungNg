import { Component, OnInit, OnDestroy, Renderer2, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../services/app.service';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs';
import {
  runOnBrowser,
  visiblePageKey
} from 'src/app/helpers/constants';

import { network } from 'tizen-tv-webapis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  subSelectedIcon: Subscription;

  selectedIcon: string = '';
  visibilityChangeListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private appService: AppService,
    private commonService: CommonService
  ) {
    this.subSelectedIcon = this.appService.selectedSidebar$.subscribe(
      value => {
        this.selectedIcon = value;
        this.cdRef.detectChanges();
      });
  }

  ngOnInit(): void {
    this.commonService.screenSaverOn();
    this.enableNetworkStateListener();

    this.visibilityChangeListener = this.renderer.listen('document', 'visibilitychange', e => {
      this.visibilityChange(e);
    });
  }

  ngOnDestroy() {
    if (runOnBrowser) {
      this.removeNetworkStateListener();
    }

    this.subSelectedIcon.unsubscribe();

    if (this.visibilityChangeListener) {
      this.visibilityChangeListener();
      this.visibilityChangeListener = null;
    }
  }

  visibilityChange(e: any): void {
    const visiblePage = this.commonService.getValueFromCache(visiblePageKey);
    if (document.hidden) {

    }
    else {
      const isConnected = this.commonService.isConnectedToGateway();
      if (!isConnected) {
        this.commonService.showElementById('noNetworkConnection');
      }
    }
  }

  enableNetworkStateListener(): void {
    if (!runOnBrowser) {
      // App running on emulator or TV
      const { addNetworkStateChangeListener, NetworkState } = network;

      addNetworkStateChangeListener((value: any) => {
        if (value == NetworkState.GATEWAY_DISCONNECTED) {
          this.showNoConnectionElement();
        }
        else if (value == NetworkState.GATEWAY_CONNECTED) {
          this.hideNoConnectionElement();
        }
      });
    }
    else {
      // App running on browser
      window.addEventListener('online', this.hideNoConnectionElement);
      window.addEventListener('offline', this.showNoConnectionElement);
    }
  }

  removeNetworkStateListener(): void {
    window.removeEventListener('online', this.hideNoConnectionElement);
    window.removeEventListener('offline', this.showNoConnectionElement);
  }

  hideNoConnectionElement(): void {
    this.commonService.hideElementById('noNetworkConnection');
  }

  showNoConnectionElement(): void {
    this.commonService.showElementById('noNetworkConnection');
  }
}
