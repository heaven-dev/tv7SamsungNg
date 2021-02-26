import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ElementRef, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { ArchiveService } from '../../services/archive.service';
import { LocaleService } from '../../services/locale.service';
import {
  videoBandwidthBits,
  streamType,
  platformVersionKey,
  videoNotOverrideNative,
  selectedArchiveProgramKey,
  programInfoPage,
  subtitlesUrlPart,
  archivePlayerControlsVisibleTimeout,
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
  @ViewChild('target', { static: true }) target: ElementRef;

  windowHeight: number = 0;
  videoDuration: number = null;
  videoCurrentTime: number = null;
  videoDurationLabel: string = null;
  videoCurrenTimeLabel: string = null;
  selectedProgram: any = null;
  controlsVisible: boolean = false;
  seeking: boolean = false;
  seekingStep: number = 10;
  timeout: any = null;
  iconAnimationDuration: number = 1400;

  playerOptions: any = null;

  keydownListener: Function;
  player: videojs.Player;

  constructor(
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private archiveService: ArchiveService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.windowHeight = this.commonService.getWindowHeight();

    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.showElementById('noNetworkConnection');
      return;
    }

    this.commonService.screenSaverOff();

    this.selectedProgram = this.commonService.stringToJson(this.commonService.getValueFromCache(selectedArchiveProgramKey));

    const archiveLanguage = this.localeService.getArchiveLanguage();
    const videoUrl = this.getVideoUrl(archiveLanguage);
    const langTag = this.getLanguageTag(archiveLanguage);

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
        src: videoUrl,
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
      if (document.hidden && !this.player.paused()) {
        this.stopTimeout();
        this.updateControls(this.videoCurrentTime);

        this.showControls();
        this.addProgramDetails();
        this.pausePlayer();
      }
      else {
        const isConnected = this.commonService.isConnectedToGateway();
        if (!isConnected) {
          this.commonService.showElementById('noNetworkConnection');
        }
      }

    });

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });

    console.log('video.js options: ', this.playerOptions);

    this.archiveService.getTranslation(this.selectedProgram.id, langTag, (data: any) => {
      this.createTrackElement(data);
      this.player = videojs(this.target.nativeElement, this.playerOptions, () => {
        this.player.on('play', function () {
          videojs.log('Video play!');
        });

        this.player.on('timeupdate', () => {
          if (this.controlsVisible && this.player) {
            if (!this.videoDuration) {
              this.videoDuration = this.player.duration();
            }

            this.updateControls(this.player.currentTime());
          }
        });

        this.player.on('ended', () => {
          videojs.log('Video end!');

          this.release();
          this.commonService.toPreviousPage(programInfoPage);
        });

        this.player.on('pause', () => {
          videojs.log('Video paused!');
        });

        this.player.on('error', () => {
          videojs.log('Error loading video!');
        });
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
    else if (keyCode === PAUSE || keyCode === STOP) {
      if (!this.player.paused()) {
        this.stopTimeout();
        this.updateControls(this.videoCurrentTime);

        this.showControls();
        this.addProgramDetails();
        this.pausePlayer();
      }
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
        this.commonService.showElementById('archivePlayerBusyLoader');
        this.commonService.screenSaverOn();
        this.release();

        this.commonService.toPreviousPage(programInfoPage);
      }
    }
  }

  pausePlayer(): void {
    if (this.player && !this.player.paused()) {
      this.player.pause();

      let elem = this.commonService.getElementById('playPauseIcon');
      if (elem) {
        elem.setAttribute('src', 'assets/pause.svg');
        this.cdRef.detectChanges();
      }

      this.showPlayPauseIcon();
    }
  }

  playPlayer(): void {
    const isConnected = this.commonService.isConnectedToGateway();
    if (!isConnected) {
      this.commonService.showElementById('noNetworkConnection');
      return;
    }

    if (this.player && this.player.paused()) {
      this.player.play();

      let elem = this.commonService.getElementById('playPauseIcon');
      if (elem) {
        elem.setAttribute('src', 'assets/play.svg');
      }

      this.showPlayPauseIcon();
    }
  }

  showPlayPauseIcon(): void {
    let elem = this.commonService.getElementById('playPauseIconContainer');
    if (elem) {
      elem.classList.add('playPauseIconFadeOut');

      setTimeout(() => {
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

    this.removeKeydownEventListener();
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
