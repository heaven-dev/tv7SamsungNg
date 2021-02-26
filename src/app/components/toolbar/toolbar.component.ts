import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common.service';
import { LocaleService } from '../../services/locale.service';
import { toolbarHeight } from '../../helpers/constants';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  toolbarLogoImage: string = '';
  toolbarHeight: string = '90px';

  constructor(
    private commonService: CommonService,
    private localeService: LocaleService
  ) { }

  ngOnInit(): void {
    this.toolbarLogoImage = this.localeService.getChannelLogo();
    this.localeService.setLocaleText('toolbarText');

    this.toolbarHeight = toolbarHeight + 'px';
  }
}
