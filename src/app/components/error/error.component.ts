import { Component, Renderer2, OnInit, AfterViewInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import {
  errorTextKey,
  somethingWentWrongText,
  runOnBrowser,
  landingPage,
  OK,
  RETURN,
  ESC,
  LEFT,
  RIGHT
} from '../../helpers/constants';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit, AfterViewInit {

  keydownListener: Function = null;

  constructor(
    private renderer: Renderer2,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.commonService.hideElementById('toolbarContainer');
    this.commonService.hideElementById('sidebar');

    this.keydownListener = this.renderer.listen('document', 'keydown', e => {
      this.keyDownEventListener(e);
    });
  }

  ngAfterViewInit(): void {
    let elem = this.commonService.getElementById('errorText');
    if (elem) {
      const errorText = this.commonService.getValueFromCache(errorTextKey);
      if (errorText) {
        elem.innerHTML = errorText;
      }
      else {
        elem.innerHTML = somethingWentWrongText;
      }

      this.commonService.focusToElement('restartButton');
    }
  }

  keyDownEventListener(e: any): void {
    const keyCode = e.keyCode;
    const contentId = e.target.id;

    if (keyCode === LEFT) {
      // LEFT arrow
      if (contentId === 'exitButton') {
        this.commonService.focusToElement('restartButton');
      }
    }
    else if (keyCode === RIGHT) {
      // RIGHT arrow
      if (contentId === 'restartButton') {
        this.commonService.focusToElement('exitButton');
      }
    }
    else if (keyCode === OK) {
      // OK button
      if (contentId === 'restartButton') {
        this.removeKeydownEventListener();
        this.commonService.toPage(landingPage, null);
      }
      else if (contentId === 'exitButton') {
        this.exitFromApp();
      }
    }
    else if (keyCode === RETURN || keyCode === ESC) {
      // RETURN button
      this.exitFromApp();
    }
  }

  removeKeydownEventListener(): void {
    if (this.keydownListener) {
      this.keydownListener();
      this.keydownListener = null;
    }
  }

  exitFromApp(): void {
    console.log('Exit from app!');

    this.removeKeydownEventListener();
    if (!runOnBrowser) {
      // @ts-ignore
      tizen.application.getCurrentApplication().exit();
    }
  }
}
