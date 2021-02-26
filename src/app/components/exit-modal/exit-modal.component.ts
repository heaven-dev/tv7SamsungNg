import { Component, OnInit } from '@angular/core';

import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'app-exit-modal',
  templateUrl: './exit-modal.component.html',
  styleUrls: ['./exit-modal.component.css']
})
export class ExitModalComponent implements OnInit {

  constructor(private localeService: LocaleService) { }

  ngOnInit(): void {
    this.localeService.setLocaleText('modalQuestionText');
    this.localeService.setLocaleText('exitYesButton');
    this.localeService.setLocaleText('exitCancelButton');
  }
}
