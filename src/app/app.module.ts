import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { LandingComponent } from './components/landing/landing.component';
import { CommonService } from './services/common.service';
import { LocaleService } from './services/locale.service';
import { TvMainComponent } from './components/tv-main/tv-main.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ExitModalComponent } from './components/exit-modal/exit-modal.component';
import { TvPlayerComponent } from './components/tv-player/tv-player.component';
import { ArchiveMainComponent } from './components/archive-main/archive-main.component';
import { ProgramInfoComponent } from './components/program-info/program-info.component';
import { ArchivePlayerComponent } from './components/archive-player/archive-player.component';
import { CategoryProgramsComponent } from './components/category-programs/category-programs.component';
import { SeriesProgramsComponent } from './components/series-programs/series-programs.component';
import { GuideComponent } from './components/guide/guide.component';
import { PlatformInfoComponent } from './components/platform-info/platform-info.component';
import { SearchComponent } from './components/search/search.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ChannelInfoComponent } from './components/channel-info/channel-info.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { ErrorComponent } from './components/error/error.component';

@NgModule({
  declarations: [
    AppComponent,
    TvMainComponent,
    ToolbarComponent,
    SidebarComponent,
    ExitModalComponent,
    TvPlayerComponent,
    ArchiveMainComponent,
    ProgramInfoComponent,
    ArchivePlayerComponent,
    CategoryProgramsComponent,
    SeriesProgramsComponent,
    GuideComponent,
    PlatformInfoComponent,
    SearchComponent,
    FavoritesComponent,
    ChannelInfoComponent,
    SearchResultComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    CommonService,
    LocaleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
