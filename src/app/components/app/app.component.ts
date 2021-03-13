import { Component, OnInit, OnDestroy, Renderer2, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../services/app.service';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs';
import {
  runOnBrowser,
  errorTextKey,
  noNetworkConnectionText,
  errorPage
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
    if (!document.hidden) {
      const isConnected = this.commonService.isConnectedToGateway();
      if (!isConnected) {
        this.commonService.cacheValue(errorTextKey, noNetworkConnectionText);
        this.commonService.toPage(errorPage, null);
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
          this.commonService.cacheValue(errorTextKey, noNetworkConnectionText);
        }
        // @ts-ignore
        else if (value == webapis.network.NetworkState.GATEWAY_CONNECTED) {
          this.commonService.removeValueFromCache(errorTextKey);
        }
      });
    }
    else {
      // App running on browser
      window.addEventListener('online', this.netOnline.bind(this));
      window.addEventListener('offline', this.netOffline.bind(this));
    }
  }

  removeNetworkStateListener(): void {
    window.removeEventListener('online', this.netOnline.bind(this));
    window.removeEventListener('offline', this.netOffline.bind(this));
  }

  netOnline(): void {
    this.commonService.removeValueFromCache(errorTextKey);
  }

  netOffline(): void {
    this.commonService.cacheValue(errorTextKey, noNetworkConnectionText);
  }
}
