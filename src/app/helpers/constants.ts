export const runOnBrowser = false;

// Platform version not to override native video. Example string value: '4.0'
export const videoNotOverrideNative = [];

export const videoUrlPart = 'https://vod.tv7.fi:443/vod/_definst_/mp4:_LINK_PATH_/playlist.m3u8';
export const subtitlesUrlPart = 'https://vod.tv7.fi:4430/vod/'
export const searchUrl = 'https://edom.tv7.fi:8443/search1.2/SearchServlet';

export const _self = '_self';
export const _LINK_PATH_ = '_LINK_PATH_';

export const landingPage = 'landing';
export const tvMainPage = 'tvmain';
export const tvPlayerPage = 'tvplayer';
export const archiveMainPage = 'archivemain';
export const guidePage = 'guide';
export const archivePlayerPage = 'archiveplayer';
export const programInfoPage = 'programinfo';
export const seriesInfoPage = 'seriesinfo';
export const categoryProgramsPage = 'categoryprograms';
export const seriesProgramsPage = 'seriesprograms';
export const searchPage = 'search';
export const favoritesPage = 'favorites';
export const searchResultPage = 'searchresult';
export const platformInfoPage = 'platforminfo';
export const channelInfoPage = 'channelinfo';
export const errorPage = 'error';

export const get_ = 'get_';

export const recommendedProgramsMethod = 'get_tv7_vod_recommendations';
export const broadcastRecommendationsProgramsMethod = 'get_tv7_broadcast_recommendations';
export const newestProgramsMethod = 'get_tv7_vod_new';
export const mostViewedProgramsMethod = 'get_tv7_vod_previousweek_stats';
export const parentCategoriesMethod = 'get_tv7_parent_categories';
export const subCategoriesMethod = 'get_tv7_sub_categories';
export const programInfoMethod = 'get_tv7_program_info';
export const categoryProgramsMethod = 'get_tv7_category_programs';
export const seriesInfoMethod = 'get_tv7_series_info';
export const seriesProgramsMethod = 'get_tv7_series_programs';
export const translationMethod = 'get_tv7_translation';
export const guideMethod = 'get_tv7_tv_guide_date';
export const searchMethod = 'searchMethod';

export const defaultRowCol = '0_0';
export const categoryDefaultRowCol = '3_0';
export const categoryRowNumber = 3;
export const seriesRowNumber = 4;
export const savedSearchKey = 'savedSearchKey';
export const searchKey = 'searchKey';
export const clearKey = 'clearKey';
export const nullValue = 'null';

// keycodes
export const LEFT = 37;
export const UP = 38;
export const RIGHT = 39;
export const DOWN = 40;
export const OK = 13;
export const RETURN = 10009;
export const ESC = 27;
export const PLAY = 415;
export const PAUSE = 19;
export const PLAYPAUSE = 10252;
export const REWIND = 412;
export const FORWARD = 417;
export const STOP = 413;
export const INFO = 457;

export const playButton = 'playButton';
export const upDownIcon = 'upDownIcon';
export const exitYesButton = 'exitYesButton';
export const exitCancelButton = 'exitCancelButton';
export const tvIconContainer = 'tvIconContainer';
export const archiveIconContainer = 'archiveIconContainer';
export const guideIconContainer = 'guideIconContainer';
export const searchIconContainer = 'searchIconContainer';
export const favoritesIconContainer = 'favoritesIconContainer';
export const platformInfoIconContainer = 'platformInfoIconContainer';
export const mainActiveElementId = 'mainActiveElementId';
export const backIconContainer = 'backIconContainer';
export const playIconContainer = 'playIconContainer';
export const favoriteIconContainer = 'favoriteIconContainer';
export const channelInfoIconContainer = 'channelInfoIconContainer';
export const seriesIconContainer = 'seriesIconContainer';
export const contentContainer = 'contentContainer';
export const backgroundImage = 'backgroundImage';

export const streamType = 'application/x-mpegURL';

export const dateParam = 'date';
export const limitParam = 'limit';
export const offsetParam = 'offset';
export const categoryParam = 'category';
export const programIdParam = 'program_id';
export const seriesIdParam = 'series_id';
export const categoryIdParam = 'category_id';
export const vodParam = 'vod';
export const queryParam = 'query';

export const keyboardNormal = 1;
export const keyboardCapital = 2;
export const keyboardSpecial = 3;

export const pnidParam = 'pnid';
export const audioIndexParam = 'audioindex';

export const tvBrand = 'samsungTV';

export const programScheduleDataKey = 'programScheduleDataKey';
export const platformVersionKey = 'platformVersionKey';
export const platformInfoKey = 'platformInfoKey';

export const originPageKey = 'originPageKey';
export const recommendedProgramsKey = 'recommendedProgramsKey';
export const broadcastRecommendationsProgramsKey = 'broadcastRecommendationsProgramsKey';
export const mostViewedProgramsKey = 'mostViewedProgramsKey';
export const newestProgramsKey = 'newestProgramsKey';
export const parentCategoriesKey = 'parentCategoriesKey';
export const subCategoriesKey = 'subCategoriesKey';
export const cacheExpirationKey = 'cacheExpirationKey';
export const selectedArchiveProgramKey = 'selectedArchiveProgramKey';
export const selectedArchiveSeriesKey = 'selectedArchiveSeriesKey';
export const archivePageStateKey = 'archivePageStateKey';
export const searchResultPageStateKey = 'searchResultPageStateKey';
export const favoritesPageStateKey = 'favoritesPageStateKey';
export const categoriesPageStateKey = 'categoriesPageStateKey';
export const seriesPageStateKey = 'seriesPageStateKey';
export const guidePageStateKey = 'guidePageStateKey';
export const searchPageStateKey = 'searchPageStateKey';
export const selectedCategoryKey = 'selectedCategoryKey';
export const favoritesDataKey = 'favoritesDataKey';
export const videoStatusDataKey = 'videoStatusDataKey';
export const savedSearchDataKey = 'savedSearchDataKey';
export const visiblePageKey = 'visiblePageKey';

export const channelUrlKey = 'channelUrlKey';

export const errorTextKey = 'errorTextKey';
export const somethingWentWrongText = 'Something went wrong :-(';
export const noNetworkConnectionText = 'No network connection :-(';
export const networkRequestFailedText = 'Network request failed :-(';
export const networkRequestTimeoutText = 'Network request timeout :-(';
export const errorReadingTvStreamText = 'Error reading tv stream from server :-(';
export const errorReadingVideoStreamText = 'Error reading video stream from server :-(';
export const videoCouldNotBeLoadedText = 'The video could not be loaded :-(';
export const streamCouldNotBeLoadedText = 'The stream could not be loaded :-(';

export const archiveCacheExpTimeMs = 1800000;

export const mainPageUpdateInterval = 10000;
export const tvPlayerControlsUpdateInterval = 10000;
export const streamErrorInterval = 1000;
export const streamErrorRecoveryCount = 3;
export const archivePlayerControlsVisibleTimeout = 6000;

export const programListMinSize = 22;

export const toolbarHeight = 90;

export const videoBandwidthBits = 50000000;

export const sidebarIconIds = [
    tvIconContainer,
    archiveIconContainer,
    guideIconContainer,
    searchIconContainer,
    favoritesIconContainer,
    channelInfoIconContainer,
    platformInfoIconContainer
];
