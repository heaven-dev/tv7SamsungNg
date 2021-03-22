import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';

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
  streamErrorInterval,
  tvMainPage,
  errorPage,
  errorTextKey,
  errorReadingTvStreamText,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  STOP,
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
  controlsVisible: boolean = false;
  programIndex: number = 0;
  programData: any = null;
  ongoingProgramIndex: number = 0;
  controlsInterval: any = null;
  errorInterval: any = null;
  streamPosition: number = 0;
  streamRetryCounter: number = 0;
  streamRecoverCounter: number = 0;

  connecting: boolean = false;
  waiting: boolean = true;
  ready: boolean = false;

  keydownListener: Function;
  visibilityChangeListener: Function = null;

  player: videojs.Player;

  constructor(
    private renderer: Renderer2,
    private commonService: CommonService,
    private programScheduleService: ProgramScheduleService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.commonService.screenSaverOff();

    let playerOptions = {
      preload: 'auto',
      autoplay: true,
      muted: false,
      fluid: true,
      playsinline: true,
      //poster: 'assets/tv7logo.png',
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
        playerOptions.html5.vhs.overrideNative = false;
        playerOptions.html5.nativeAudioTracks = true;
        playerOptions.html5.nativeVideoTracks = true;
      }
    }

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    this.visibilityChangeListener = this.renderer.listen('document', 'visibilitychange', e => {
      this.visibilityChange(e);
    });

    this.programData = this.commonService.getValueFromCache(programScheduleDataKey);
    if (this.programData) {
      this.programData = this.commonService.stringToJson(this.programData);
      //console.log('Program count: ', programData.length);
    }

    this.createPlayer(playerOptions);

    this.addErrorInterval(playerOptions);
  }

  ngOnDestroy(): void {
    this.release();
  }

  createPlayer(options: any): void {
    console.log('video.js options: ', options);

    this.createVideoElement();

    const videoElem = this.commonService.getElementById('videoPlayer');
    if (videoElem) {
      this.player = videojs(videoElem, options, () => {
        this.player.on('play', () => {
          if (this.player) {
            videojs.log('Video play!');

            this.player.error(null);
          }
        });

        this.player.on('timeupdate', () => {
          if (this.player) {
            const time = this.player.currentTime();
            //videojs.log('Video timeupdate: ', time);

            if (time > 0) {
              this.waiting = false;
              this.ready = true;
            }
          }
        });

        this.player.on('ended', () => {
          if (this.player) {
            videojs.log('Video end!');

            this.player.error(null);
          }
        });

        this.player.on('pause', () => {
          if (this.player) {
            videojs.log('Video paused!');

            this.player.error(null);
          }
        });

        this.player.on('error', () => {
          if (this.player) {
            videojs.log('Video error!');

            this.player.error(null);
          }
        });

        this.player.on('suspend', () => {
          videojs.log('Video suspend!');
        });

        this.player.on('abort', () => {
          videojs.log('Video abort!');
        });

        this.player.on('emptied', () => {
          videojs.log('Video emptied!');
        });

        this.player.on('stalled', () => {
          videojs.log('Video stalled!');
        });

        this.player.on('canplaythrough', () => {
          videojs.log('Video canplaythrough!');
        });

        this.player.on('canplay', () => {
          if (this.player) {
            videojs.log('Video canplay!');
          }
        });

        this.player.on('playing', () => {
          if (this.player) {
            videojs.log('Video playing!');
            this.hideConnectingAndWaiting();
          }
        });

        this.player.on('waiting', () => {
          if (this.player) {
            videojs.log('Video waiting!');

            //this.waiting = true;
            this.player.error(null);
          }
        });
      });
    }
  }

  hideConnectingAndWaiting(): void {
    this.connecting = false;
    this.waiting = false;
  }

  createVideoElement(): void {
    let videoElem = document.createElement('video');
    if (videoElem) {
      videoElem.setAttribute('id', 'videoPlayer');
      videoElem.setAttribute('class', 'video-js');

      const container = this.commonService.getElementById('videoPlayerContainer');
      if (container) {
        container.appendChild(videoElem);
      }
    }
  }

  removeEventListeners(): void {
    if (this.keydownListener) {
      this.keydownListener();
      this.keydownListener = null;
    }

    if (this.visibilityChangeListener) {
      this.visibilityChangeListener();
      this.visibilityChangeListener = null;
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
    else if (keyCode === STOP) {
      this.exitFromPlayer();
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

  visibilityChange(e: any): void {
    if (document.hidden) {
      this.exitFromPlayer();
    }
  }

  release(): void {
    this.commonService.screenSaverOn();
    this.stopControlsInterval();
    this.stopErrorInterval();
    this.removeEventListeners();

    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  }

  exitFromPlayer(): void {
    //this.commonService.showElementById('tvPlayerBusyLoader');
    this.release();

    this.commonService.toPage(tvMainPage, tvMainPage);
  }

  addControlsInterval(): void {
    this.ongoingProgramIndex = this.programScheduleService.getOngoingProgramIndex(this.programData);

    // Update controls (status bar, date time)
    this.controlsInterval = setInterval(() => {
      if (this.controlsVisible) {
        this.updateProgramDetails(true);
      }
    }, tvPlayerControlsUpdateInterval);
  }

  stopControlsInterval(): void {
    if (this.controlsInterval) {
      clearInterval(this.controlsInterval);
      this.controlsInterval = null;
    }
  }

  addErrorInterval(options: any): void {
    this.errorInterval = setInterval(() => {
      if (this.player) {
        let currentTime = Math.round(this.player.currentTime());
        console.log('***Stream currentTime: ', currentTime, '***');

        if (currentTime <= this.streamPosition) {
          if (this.ready && !this.connecting) {
            this.waiting = true;
          }

          if (this.streamRecoverCounter === 5) {
            // to error page
            this.commonService.cacheValue(errorTextKey, errorReadingTvStreamText);

            this.hideConnectingAndWaiting();
            this.release();
            this.commonService.toPage(errorPage, null);
          }

          // stream stopped
          if (this.streamRetryCounter === 6) {
            console.log('***Recreate player to recover: ', currentTime, '***');

            this.waiting = false;
            this.connecting = true;

            this.streamRetryCounter = 0;
            this.streamRecoverCounter++;

            this.player.dispose();
            this.createPlayer(options);
          }

          this.streamRetryCounter++;
        }
        else {
          this.streamRetryCounter = 0;
          this.streamRecoverCounter = 0;
        }

        this.streamPosition = currentTime;
      }
    }, streamErrorInterval);
  }

  stopErrorInterval(): void {
    if (this.errorInterval) {
      clearInterval(this.errorInterval);
      this.errorInterval = null;
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

    this.addControlsInterval();
  }

  hideControls(): void {
    this.commonService.hideElementById('programDetails');

    this.stopControlsInterval();

    this.programIndex = 0;
    this.controlsVisible = false;
  }
}
