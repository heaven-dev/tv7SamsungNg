import { Component, OnInit, OnDestroy, Renderer2, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../services/app.service';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs';
import {
  runOnBrowser,
  visiblePageKey
} from 'src/app/helpers/constants';

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
      // @ts-ignore
      webapis.network.addNetworkStateChangeListener((value: any) => {
        // @ts-ignore
        if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED) {
          this.commonService.showElementById('noNetworkConnection');
        }
        // @ts-ignore
        else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
          this.commonService.hideElementById('noNetworkConnection');
        }
      });
    }
    else {
      // App running on browser
      window.addEventListener('online', this.hideNoConnectionElement.bind(this));
      window.addEventListener('offline', this.showNoConnectionElement.bind(this));
    }
  }

  removeNetworkStateListener(): void {
    window.removeEventListener('online', this.hideNoConnectionElement.bind(this));
    window.removeEventListener('offline', this.showNoConnectionElement.bind(this));
  }

  hideNoConnectionElement(): void {
    this.commonService.hideElementById('noNetworkConnection');
  }

  showNoConnectionElement(): void {
    this.commonService.showElementById('noNetworkConnection');
  }
}
