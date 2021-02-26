import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { CommonService } from '../../services/common.service';
import { ProgramScheduleService } from '../../services/program-schedule.service';
import { LocaleService } from '../../services/locale.service';
import {
  platformVersionKey,
  videoNotOverrideNative,
  videoBandwidthBits,
  streamType,
  programScheduleDataKey,
  tvPlayerControlsUpdateInterval,
  tvMainPage,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  INFO,
  RETURN,
  ESC
} from '../../helpers/constants';
import videojs from 'video.js';

@Component({
  selector: 'app-tv-player',
  templateUrl: './tv-player.component.html',
  styleUrls: ['./tv-player.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TvPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: true }) target: ElementRef;

  playerOptions: any = null;
  controlsVisible: boolean = false;
  programIndex: number = 0;
  programData: any = null;
  ongoingProgramIndex: number = 0;
  interval: any = null;

  keydownListener: Function;
  player: videojs.Player;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private commonService: CommonService,
    private programScheduleService: ProgramScheduleService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.showElementById('noNetworkConnection');
      return;
    }

    this.commonService.screenSaverOff();

    this.playerOptions = {
      preload: 'auto',
      autoplay: true,
      muted: false,
      fluid: true,
      html5: {
        vhs: {
          overrideNative: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      },
      bandwidth: videoBandwidthBits,
      sources: {
        src: this.localeService.getChannelUrl(),
        type: streamType
      }
    };

    const platformVersion = this.commonService.getValueFromCache(platformVersionKey);
    if (platformVersion) {
      if (videoNotOverrideNative.indexOf(platformVersion) !== -1) {
        this.playerOptions.html5.vhs.overrideNative = false;
        this.playerOptions.html5.nativeAudioTracks = true;
        this.playerOptions.html5.nativeVideoTracks = true;
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const isConnected = this.commonService.isConnectedToGateway();
        if (!isConnected) {
          this.commonService.showElementById('noNetworkConnection');
        }
      }
    });

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.programData = this.commonService.getValueFromCache(programScheduleDataKey);
    if (this.programData) {
      this.programData = this.commonService.stringToJson(this.programData);
      //console.log('Program count: ', programData.length);
    }

    console.log('video.js options: ', this.playerOptions);

    this.player = videojs(this.target.nativeElement, this.playerOptions, () => {
      this.player.on('play', () => {
        videojs.log('Video play!');
      });

      this.player.on('ended', () => {
        videojs.log('Video end!');
      });

      this.player.on('pause', () => {
        videojs.log('Video paused!');
      });

      this.player.on('error', () => {
        videojs.log('Error loading video!');
      });
    });
  }

  ngOnDestroy(): void {
    this.release();
  }

  removeKeydownEventListener(): void {
    if (this.keydownListener) {
      this.keydownListener();
      this.keydownListener = null;
    }
  }

  keyDownEventListener(e: any): void {
    const keyCode = e.keyCode;

    if (keyCode === UP) {
      // UP arrow
    }
    else if (keyCode === DOWN) {
      // DOWN arrow
    }
    else if (keyCode === LEFT) {
      // LEFT arrow
      if (this.controlsVisible && this.programIndex > 0
        && !this.programScheduleService.isOngoingProgram(this.programData, this.programIndex)) {
        this.programIndex--;
        this.updateProgramDetails(false);
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow
      if (this.controlsVisible && this.programScheduleService.isInIndex(this.programData, this.programIndex + 1)) {
        this.programIndex++;
        this.updateProgramDetails(false);
      }
    }
    else if (keyCode === OK || keyCode === INFO) {
      // OK button
      if (!this.controlsVisible) {
        // Show controls
        this.showControls();

        this.programIndex = 0;
        this.updateProgramDetails(false);
      }
      else {
        // Hide controls
        this.hideControls();
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.controlsVisible) {
        this.hideControls();
      }
      else {
        this.exitFromPlayer();
      }
    }
  }

  release(): void {
    this.commonService.screenSaverOn();
    this.stopInterval();

    if (this.player) {
      this.player.dispose();
      this.playerOptions = null;
    }
  }

  exitFromPlayer(): void {
    this.commonService.showElementById('tvPlayerBusyLoader');
    this.release();
    this.removeKeydownEventListener();

    this.router.navigate([tvMainPage]);
  }

  addInterval(): void {
    this.ongoingProgramIndex = this.programScheduleService.getOngoingProgramIndex(this.programData);

    // Update controls (status bar, date time)
    this.interval = setInterval(() => {
      if (this.controlsVisible) {
        this.updateProgramDetails(true);
      }
    }, tvPlayerControlsUpdateInterval);
  }

  stopInterval(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  updateProgramDetails(fromTimer: boolean): void {
    let elem = null;

    if (fromTimer) {
      const index = this.programScheduleService.getOngoingProgramIndex(this.programData);
      if (index !== this.ongoingProgramIndex) {
        // ongoing program changed
        if (this.programIndex <= 1) {
          this.programIndex = 0;
        }
        else {
          this.programIndex--;
        }

        this.ongoingProgramIndex = index;
      }
    }

    if (!fromTimer || (fromTimer && this.programIndex === 0)) {
      const program = this.programScheduleService.getProgramByIndex(this.programData, this.programIndex);
      if (program) {
        elem = this.commonService.getElementById('programDetails');
        if (elem) {
          elem.style.display = 'flex';
        }

        let date = program.isStartDateToday ? '' : program.localStartDate + ' | ';

        this.commonService.addToElement('programName', date + program.localStartTime + ' - ' + program.localEndTime + ' ' + program.name_desc);

        this.commonService.addToElement('programDescription', program.caption ? program.caption : '');

        elem = this.commonService.getElementById('statusBar');
        if (elem) {
          elem.style.width = program.passedPercent + '%';
        }

        if (this.programIndex === 0) {
          this.commonService.hideElementById('comingProgramsText');
          this.commonService.showElementById('statusBarContainer');
        }
        else {
          this.commonService.showElementById('comingProgramsText');
          this.commonService.hideElementById('statusBarContainer');
        }
      }
    }

    this.commonService.addToElement('dateTime', this.programScheduleService.getLocalDateTime());
  }

  showControls(): void {
    this.localeService.setLocaleText('comingProgramsText');
    this.updateProgramDetails(false);

    this.controlsVisible = true;

    this.addInterval();
  }

  hideControls(): void {
    this.commonService.hideElementById('programDetails');

    this.stopInterval();

    this.programIndex = 0;
    this.controlsVisible = false;
  }
}
