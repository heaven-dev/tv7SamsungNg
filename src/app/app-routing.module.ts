import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './components/landing/landing.component';
import { TvMainComponent } from './components/tv-main/tv-main.component';
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
import { SearchResultComponent } from './components/search-result/search-result.component';
import { ErrorComponent } from './components/error/error.component';

import {
  landingPage,
  tvMainPage,
  tvPlayerPage,
  archiveMainPage,
  programInfoPage,
  archivePlayerPage,
  categoryProgramsPage,
  seriesProgramsPage,
  guidePage,
  platformInfoPage,
  searchPage,
  favoritesPage,
  searchResultPage,
  errorPage
} from './helpers/constants';

const routes: Routes = [
  { path: '', redirectTo: landingPage, pathMatch: 'full' },
  { path: landingPage, component: LandingComponent },
  { path: tvMainPage, component: TvMainComponent },
  { path: tvPlayerPage, component: TvPlayerComponent },
  { path: archiveMainPage, component: ArchiveMainComponent },
  { path: programInfoPage, component: ProgramInfoComponent },
  { path: archivePlayerPage, component: ArchivePlayerComponent },
  { path: categoryProgramsPage, component: CategoryProgramsComponent },
  { path: seriesProgramsPage, component: SeriesProgramsComponent },
  { path: guidePage, component: GuideComponent },
  { path: platformInfoPage, component: PlatformInfoComponent },
  { path: searchPage, component: SearchComponent },
  { path: favoritesPage, component: FavoritesComponent },
  { path: searchResultPage, component: SearchResultComponent },
  { path: errorPage, component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
