import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { ArchiveService } from '../../services/archive.service';
import { LocaleService } from '../../services/locale.service';
import {
  videoStatusDataKey,
  videoBandwidthBits,
  streamType,
  platformVersionKey,
  videoNotOverrideNative,
  selectedArchiveProgramKey,
  programInfoPage,
  errorPage,
  errorTextKey,
  errorReadingVideoStreamText,
  subtitlesUrlPart,
  archivePlayerControlsVisibleTimeout,
  streamErrorInterval,
  videoUrlPart,
  _LINK_PATH_,
  pnidParam,
  vodParam,
  tvBrand,
  audioIndexParam,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  OK,
  INFO,
  FORWARD,
  REWIND,
  PLAY,
  PLAYPAUSE,
  STOP,
  PAUSE,
  RETURN,
  ESC
} from '../../helpers/constants';

import videojs from 'video.js';

@Component({
  selector: 'app-archive-player',
  templateUrl: './archive-player.component.html',
  styleUrls: ['./archive-player.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ArchivePlayerComponent implements OnInit, OnDestroy {
  windowHeight: number = 0;
  videoDuration: number = null;
  videoCurrentTime: number = null;
  videoDurationLabel: string = null;
  videoCurrenTimeLabel: string = null;
  selectedProgram: any = null;
  videoStatus: any = null;
  translation: any = null;
  controlsVisible: boolean = false;
  seeking: boolean = false;
  seekingStep: number = 10;
  timeout: any = null;
  errorInterval: any = null;
  streamPosition: number = -1;
  streamRetryCounter: number = 0;
  streamRecoverCounter: number = 0;
  paused: boolean = false;

  connecting: boolean = false;
  waiting: boolean = true;
  ready: boolean = false;
  iconAnimationDuration: number = 1400;

  keydownListener: Function;
  visibilityChangeListener: Function = null;

  player: videojs.Player;

  constructor(
    private renderer: Renderer2,
    private commonService: CommonService,
    private archiveService: ArchiveService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.windowHeight = this.commonService.getWindowHeight();

    this.commonService.screenSaverOff();

    this.selectedProgram = this.commonService.stringToJson(this.commonService.getValueFromCache(selectedArchiveProgramKey));

    const archiveLanguage = this.localeService.getArchiveLanguage();
    const videoUrl = this.getVideoUrl(archiveLanguage);
    const langTag = this.getLanguageTag(archiveLanguage);

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
        src: videoUrl,
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

    this.preparePlayer(playerOptions, langTag);

    this.addErrorInterval(playerOptions);
  }

  ngOnDestroy(): void {
    this.release();
  }

  preparePlayer(options: any, langTag: string): void {
    this.archiveService.getTranslation(this.selectedProgram.id, langTag, (data: any) => {
      if (data !== null) {
        this.translation = data;
        this.createPlayer(options);
      }
      else {
        this.removeEventListeners();

        this.commonService.toPage(errorPage, null);
      }
    });
  }

  createPlayer(options: any): void {
    console.log('video.js options: ', options);

    this.createVideoElement();

    if (this.translation && this.translation.lang) {
      this.createTrackElement(this.translation.lang);
    }

    this.videoStatus = this.getVideoStatus();

    const videoElem = this.commonService.getElementById('videoPlayer');
    if (videoElem) {
      this.player = videojs(videoElem, options, () => {

        this.player.on('play', () => {
          videojs.log('Video play!');

          this.ready = true;
          this.player.error(null);
        });

        this.player.on('loadedmetadata', () => {
          videojs.log('Video loadedmetadata!');

          if (this.videoStatus && this.videoStatus.p < 100) {
            this.player.currentTime(this.videoStatus.c);
          }
        });

        this.player.on('timeupdate', () => {
          const time = this.player.currentTime();
          if (time > 0) {
            this.waiting = false;
            this.ready = true;
          }

          if (this.controlsVisible && this.player) {
            if (!this.videoDuration) {
              this.videoDuration = this.player.duration();
            }

            this.updateControls(time);
          }

          this.player.error(null);
        });

        this.player.on('ended', () => {
          videojs.log('Video end!');
          this.player.error(null);

          this.saveVideoStatus();

          this.release();
          this.commonService.toPreviousPage(programInfoPage);
        });

        this.player.on('pause', () => {
          videojs.log('Video paused!');
          this.player.error(null);
        });

        this.player.on('error', () => {
          if (this.player) {
            this.player.error(null);
            this.saveVideoStatus();
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
            this.ready = true;
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
    else if (keyCode === LEFT || keyCode === REWIND) {
      // LEFT arrow
      if (this.controlsVisible) {
        if (!this.seeking && this.player) {
          this.stopTimeout();

          this.pausePlayer();
          this.currentTime();

          this.seeking = true;
        }

        this.videoCurrentTime -= this.seekingStep;
        if (this.videoCurrentTime < 0) {
          this.videoCurrentTime = 0;
        }

        this.updateControls(this.videoCurrentTime);
      }
    }
    else if (keyCode === RIGHT || keyCode === FORWARD) {
      // RIGHT arrow
      if (this.controlsVisible) {
        if (!this.seeking && this.player) {
          this.stopTimeout();

          this.pausePlayer();
          this.currentTime();

          this.seeking = true;
        }

        this.videoCurrentTime += this.seekingStep;
        if (this.videoCurrentTime > this.videoDuration) {
          this.videoCurrentTime = this.videoDuration;
        }

        this.updateControls(this.videoCurrentTime);
      }
    }
    else if (keyCode === PLAYPAUSE) {
      if (!this.player.paused()) {
        this.stopTimeout();
        this.updateControls(this.videoCurrentTime);

        this.showControls();
        this.addProgramDetails();
        this.pausePlayer();
      }
      else {
        if (this.seeking) {
          this.player.currentTime(this.videoCurrentTime);
        }

        this.playPlayer();
        this.hideControls();
      }
    }
    else if (keyCode === PAUSE) {
      if (!this.player.paused()) {
        this.stopTimeout();
        this.updateControls(this.videoCurrentTime);

        this.showControls();
        this.addProgramDetails();
        this.pausePlayer();
      }
    }
    else if (keyCode === STOP) {
      this.saveVideoStatus();

      this.commonService.screenSaverOn();
      this.release();

      this.commonService.toPreviousPage(programInfoPage);
    }
    else if (keyCode === PLAY) {
      if (this.player.paused()) {
        if (this.seeking) {
          this.player.currentTime(this.videoCurrentTime);
        }

        this.playPlayer();
        this.hideControls();
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (this.controlsVisible) {
        this.stopTimeout();

        if (this.seeking) {
          this.hideControls();

          this.player.currentTime(this.videoCurrentTime);
          this.playPlayer();
        }
        else {
          if (this.player.paused()) {
            this.playPlayer();
            this.hideControls();
          }
          else {
            this.pausePlayer();
          }
        }
      }
      else {
        this.addTimeout();
        this.updateControls(this.videoCurrentTime);

        this.showControls();
        this.addProgramDetails();
      }
    }
    else if (keyCode === INFO) {
      if (!this.controlsVisible) {
        this.addTimeout();
        this.updateControls(this.videoCurrentTime);

        this.showControls();
        this.addProgramDetails();
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      if (this.controlsVisible) {
        this.stopTimeout();
        this.hideControls();

        this.currentTime();

        this.playPlayer();
      }
      else {
        //this.commonService.showElementById('archivePlayerBusyLoader');

        this.saveVideoStatus();

        this.commonService.screenSaverOn();
        this.release();

        this.commonService.toPreviousPage(programInfoPage);
      }
    }
  }

  visibilityChange(e: any): void {
    if (document.hidden) {
      this.stopTimeout();
      this.saveVideoStatus();

      this.commonService.screenSaverOn();
      this.release();

      this.commonService.toPreviousPage(programInfoPage);
    }
  }

  pausePlayer(): void {
    if (this.player && !this.player.paused()) {
      this.commonService.screenSaverOn();
      this.player.pause();
      this.paused = true;

      this.commonService.showElementById('pauseIconContainer');

      this.showPlayPauseIcon(false);
    }
  }

  playPlayer(): void {
    if (this.player && this.player.paused()) {
      this.commonService.screenSaverOff();
      this.player.play();
      this.paused = false;

      this.commonService.showElementById('playIconContainer');

      this.showPlayPauseIcon(true);
    }
  }

  getVideoStatus(): any {
    let videoItem = null;

    let vs: any = this.commonService.getSavedValue(videoStatusDataKey);
    if (vs) {
      vs = this.commonService.stringToJson(vs);

      const { id } = this.selectedProgram;

      for (let i = 0; i < vs.length; i++) {
        if (vs[i].id === id) {
          videoItem = vs[i];
          break;
        }
      }
    }

    return videoItem;
  }

  saveVideoStatus(): void {
    if (!this.selectedProgram || !this.player) {
      return;
    }

    let vs: any = this.commonService.getSavedValue(videoStatusDataKey);
    if (vs) {
      vs = this.commonService.stringToJson(vs);
    }
    else {
      vs = [];
    }

    let p = 0;
    const c = this.player.currentTime();
    if (c > 0) {
      const { id } = this.selectedProgram;

      for (let i = 0; i < vs.length; i++) {
        if (vs[i].id === id) {
          vs.splice(i, 1);
          break;
        }
      }

      const d = this.player.duration();

      if (d - c <= 60) {
        p = 100;
      }
      else {
        p = Math.round(c / d * 100);
        if (p < 0) {
          p = 0;
        }
        if (p > 100) {
          p = 100;
        }
      }

      vs.unshift({ id: id, c: Math.round(c), p: p });
      this.commonService.saveValue(videoStatusDataKey, this.commonService.jsonToString(vs));
    }
  }

  showPlayPauseIcon(isPlayIcon: boolean): void {
    const elementId = isPlayIcon ? 'playIconContainer' : 'pauseIconContainer';

    let elem = this.commonService.getElementById(elementId);
    if (elem) {
      elem.classList.add('playPauseIconFadeOut');

      setTimeout(() => {
        this.commonService.hideElementById(elementId);
        elem.classList.remove('playPauseIconFadeOut');
      }, this.iconAnimationDuration)
    }
  }

  currentTime(): void {
    this.videoCurrentTime = this.player.currentTime();
  }

  /*
  Archive video URL:
  - https://vod.tv7.fi:443/vod/_definst_/mp4:" + link_path + "/playlist.m3u8
  - query string:
    - pnid = program id
    - vod = app id (samsung, lg, android) + channel id (FI1, ET1, SV1, RU1), for example lg-FI1 or samsung-ET1
    - audioindex is 0, nebesa channel videos audioindex is always 1
  */
  getVideoUrl(archiveLanguage: string): string {
    let audioIndex: string = '0';

    // @ts-ignore
    if (archiveLanguage === 'RU1') {
      audioIndex = '1';
    }

    const url = videoUrlPart.replace(_LINK_PATH_, this.getPath())
      + '?' + pnidParam + '=' + this.selectedProgram.id
      + '&' + vodParam + '=' + tvBrand + '-' + archiveLanguage
      + '&' + audioIndexParam + '=' + audioIndex;

    //console.log('Video URL: ', url);

    return url;
  }

  getPath(): string {
    let path = null;
    if (this.selectedProgram.link_path && this.selectedProgram.link_path.length) {
      path = this.selectedProgram.link_path;
    }
    else if (this.selectedProgram.path && this.selectedProgram.path.length) {
      path = this.selectedProgram.path;
    }

    return path;
  }

  release(): void {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }

    this.stopErrorInterval();
    this.removeEventListeners();
  }

  showControls(): void {
    setTimeout(() => {
      this.commonService.showElementById('controls');
    }, 200);

    this.currentTime();

    this.controlsVisible = true;
    this.updateControls(this.videoCurrentTime);
  }

  hideControls(): void {
    this.commonService.hideElementById('controls');

    this.controlsVisible = false;
    this.seeking = false;

    this.updateControls(0);
  }

  addProgramDetails(): void {
    if (this.selectedProgram) {
      if (this.selectedProgram.name_desc) {
        this.commonService.addToElement('nameDesc', this.selectedProgram.name_desc);
      }

      if (this.selectedProgram.caption) {
        this.commonService.addToElement('caption', this.selectedProgram.caption);
      }

      if (this.selectedProgram.episode_number) {
        this.commonService.addToElement('episodeNumber', this.localeService.getLocaleTextById('episodeText') + ': ' + this.selectedProgram.episode_number);
      }
    }
  }

  updateControls(currentTime: number): void {
    this.videoDurationLabel = this.commonService.getTimeStampByDuration(this.videoDuration * 1000);
    this.videoCurrenTimeLabel = this.commonService.getTimeStampByDuration(currentTime * 1000);

    const timeAndDurationLabel = this.videoCurrenTimeLabel + ' / ' + this.videoDurationLabel;
    this.commonService.addToElement('durationCurrentTime', timeAndDurationLabel);

    const percent = currentTime / this.videoDuration * 100;
    let element = this.commonService.getElementById('statusBar');
    if (element) {
      element.style.width = percent + '%';
    }
  }

  addTimeout(): void {
    this.timeout = setTimeout(() => {
      if (this.controlsVisible) {
        this.hideControls();
      }
    }, archivePlayerControlsVisibleTimeout);
  }

  stopTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  addErrorInterval(options: any): void {
    this.errorInterval = setInterval(() => {
      if (this.player && !this.paused) {
        let currentTime = this.player.currentTime();
        console.log('***Stream currentTime: ', currentTime, '***');

        if (currentTime <= this.streamPosition) {
          console.log('***Video stopped: ', currentTime, '***');
          if (this.ready && !this.connecting) {
            this.waiting = true;
          }

          if (this.streamRecoverCounter === 5) {
            // to error page
            this.commonService.cacheValue(errorTextKey, errorReadingVideoStreamText);

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
          this.saveVideoStatus();

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

  getLanguageTag(archiveLanguage: string): string {
    let langTag = 'fi';
    // @ts-ignore
    if (archiveLanguage === 'ET1') {
      langTag = 'et';
    }
    // @ts-ignore
    else if (archiveLanguage === 'SV1') {
      langTag = 'sv';
    }
    // @ts-ignore
    else if (archiveLanguage === 'RU1') {
      langTag = 'ru';
    }

    return langTag;
  }

  createTrackElement(data: any): void {
    const videoPlayer = this.commonService.getElementById('videoPlayer');
    if (videoPlayer && data && data.is_subtitle === '1') {

      let track = document.createElement('track');
      if (track) {
        track.setAttribute('kind', 'subtitles');
        track.setAttribute('src', subtitlesUrlPart + data.path);
        track.setAttribute('label', data.language);
        track.setAttribute('srclang', data.lang_id);
        track.setAttribute('default', null);

        videoPlayer.appendChild(track);
      }
    }
  }
}
