import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-connecting',
  templateUrl: './connecting.component.html',
  styleUrls: ['./connecting.component.css']
})
export class ConnectingComponent implements OnInit, OnDestroy {

  interval: any = null;
  intervalTimeout: number = 600;
  counter = 0;

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.interval = setInterval(() => {
      let element = this.commonService.getElementById('connecting');
      if (element) {
        if (this.counter === 0) {
          element.innerHTML = 'Connecting';
        }
        else if (this.counter === 1) {
          element.innerHTML = 'Connecting.';
        }
        else if (this.counter === 2) {
          element.innerHTML = 'Connecting..';
        }
        else if (this.counter === 3) {
          element.innerHTML = 'Connecting...';
        }
      }

      if (this.counter === 3) {
        this.counter = 0;
      }
      else {
        this.counter++;
      }
    }, this.intervalTimeout);
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
