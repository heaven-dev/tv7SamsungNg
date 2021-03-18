import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { LocaleService } from '../../services/locale.service';
import { toolbarHeight, sidebarIconIds } from '../../helpers/constants';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() selectedIcon: string = '';

  sidebarHeight: string = '';

  constructor(private commonService: CommonService, private localeService: LocaleService) { }

  ngOnInit(): void {
    this.sidebarHeight = (this.commonService.getWindowHeight() - toolbarHeight) + 'px';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('selectedIcon')) {
      this.setSelectedSidebarIcon(changes['selectedIcon'].currentValue);
    }
  }

  focusInToMenuEvent(element: any): void {
    const tvIconText = this.commonService.getElementById('tvIconText');
    if (tvIconText) {
      this.commonService.showElement(tvIconText);
      this.localeService.setLocaleText('tvIconText');
    }

    const archiveIconText = this.commonService.getElementById('archiveIconText');
    if (archiveIconText) {
      this.commonService.showElement(archiveIconText);
      this.localeService.setLocaleText('archiveIconText');
    }

    const guideIconText = this.commonService.getElementById('guideIconText');
    if (guideIconText) {
      this.commonService.showElement(guideIconText);
      this.localeService.setLocaleText('guideIconText');
    }

    const searchIconText = this.commonService.getElementById('searchIconText');
    if (searchIconText) {
      this.commonService.showElement(searchIconText);
      this.localeService.setLocaleText('searchIconText');
    }

    const favoritesIconText = this.commonService.getElementById('favoritesIconText');
    if (favoritesIconText) {
      this.commonService.showElement(favoritesIconText);
      this.localeService.setLocaleText('favoritesIconText');
    }

    const channelInfoIconText = this.commonService.getElementById('channelInfoIconText');
    if (channelInfoIconText) {
      this.commonService.showElement(channelInfoIconText);
      this.localeService.setLocaleText('channelInfoIconText');
    }

    const platformInfoIconText = this.commonService.getElementById('platformInfoIconText');
    if (platformInfoIconText) {

      // @ts-ignore
      if (this.localeService.getArchiveLanguage() === 'SV1') {
        const sideMenuTextIds = [
          'tvIconText',
          'archiveIconText',
          'guideIconText',
          'searchIconText',
          'favoritesIconText',
          'channelInfoIconText',
          'platformInfoIconText'
        ];

        for (let i = 0; i < sideMenuTextIds.length; i++) {
          let elem = this.commonService.getElementById(sideMenuTextIds[i]);
          if (elem) {
            elem.style.marginRight = 40 + 'px';
          }
        }
      }

      this.commonService.showElement(platformInfoIconText);
      this.localeService.setLocaleText('platformInfoIconText');
    }
  }

  focusOutFromMenuEvent(element: any): void {
    this.commonService.focusOutFromMenuEvent();
  }

  setSelectedSidebarIcon(selected: string): void {
    let elem = this.commonService.getElementById(selected);
    if (elem) {
      elem.classList.add('selectedIcon');
    }

    for (let i = 0; i < sidebarIconIds.length; i++) {
      if (selected !== sidebarIconIds[i]) {
        elem = this.commonService.getElementById(sidebarIconIds[i]);
        if (elem) {
          elem.classList.remove('selectedIcon');
        }
      }
    }
  }
}
