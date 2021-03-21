import { Component, Renderer2, OnInit, AfterViewInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import {
  errorTextKey,
  somethingWentWrongText,
  runOnBrowser,
  OK,
  RETURN,
  ESC
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

      let closeButton = this.commonService.getElementById('closeButton');
      if (closeButton) {
        closeButton.focus();
      }
    }
  }

  keyDownEventListener(e: any): void {
    const keyCode = e.keyCode;

    if (keyCode === OK || keyCode === RETURN || keyCode === ESC) {
      // OK button
      console.log('Button clicked.');

      if (!runOnBrowser) {
        this.removeKeydownEventListener();

        // @ts-ignore
        tizen.application.getCurrentApplication().exit();
      }
    }
  }

  removeKeydownEventListener(): void {
    if (this.keydownListener) {
      this.keydownListener();
      this.keydownListener = null;
    }
  }
}
