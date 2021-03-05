import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../services/app.service';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs';
import { runOnBrowser } from 'src/app/helpers/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  subSelectedIcon: Subscription;

  selectedIcon: string = '';

  constructor(
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
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const isConnected = this.commonService.isConnectedToGateway();
        if (!isConnected) {
          this.commonService.showElementById('noNetworkConnection');
        }
      }
    });

    this.commonService.screenSaverOn();
    this.enableNetworkStateListener();
  }

  ngOnDestroy() {
    this.subSelectedIcon.unsubscribe();
  }

  enableNetworkStateListener(): void {
    if (!runOnBrowser) {
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
  }
}
