import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { LocaleService } from './locale.service';
import {
  cacheExpirationKey,
  recommendedProgramsKey,
  searchUrl,
  recommendedProgramsMethod,
  dateParam,
  limitParam,
  offsetParam,
  categoryParam,
  categoryIdParam,
  programIdParam,
  seriesIdParam,
  vodParam,
  queryParam,
  get_,
  nullValue,
  archiveCacheExpTimeMs,
  broadcastRecommendationsProgramsKey,
  broadcastRecommendationsProgramsMethod,
  newestProgramsKey,
  newestProgramsMethod,
  mostViewedProgramsKey,
  mostViewedProgramsMethod,
  parentCategoriesKey,
  parentCategoriesMethod,
  subCategoriesKey,
  subCategoriesMethod,
  categoryProgramsMethod,
  programInfoMethod,
  seriesInfoMethod,
  seriesProgramsMethod,
  translationMethod,
  searchMethod,
  errorTextKey,
  networkRequestFailedText,
  networkRequestTimeoutText
} from '../helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {

  constructor(
    private commonService: CommonService,
    private localeService: LocaleService
  ) { }

  getRecommendedPrograms(date: string, limit: number, offset: number, cb: Function): void {
    if (!this.isCacheExpired(cacheExpirationKey + recommendedProgramsKey)) {
      const recommended = this.getDataFromCache(recommendedProgramsKey);
      if (recommended) {
        console.log('**Return recommended data from cache.');
        cb(recommended);
      }
    }
    else {
      const url = this.localeService.getArchiveUrl() + recommendedProgramsMethod + '?' + dateParam + '=' + date + '&' + limitParam + '=' + limit
        + '&' + offsetParam + '=' + offset;

      console.log('Recommended URL: ', url);

      this.runQuery(url, (data: any) => {
        if (data) {
          data = this.commonService.stringToJson(data);

          const rootProp = recommendedProgramsMethod.replace(get_, '');

          data = data[rootProp];

          if (!data || data.length <= 4) {
            this.getBroadcastRecommendationsPrograms(date, limit, offset, function (data) {
              cb(data);
            });
          }
          else {
            data = this.filterResponse(data, recommendedProgramsMethod);

            if (data && data.length) {
              this.cacheData(recommendedProgramsKey, this.commonService.jsonToString(data));
            }

            cb(data);
          }
        }
        else {
          cb(null);
        }
      });
    }
  }

  getBroadcastRecommendationsPrograms(date: string, limit: number, offset: number, cb: Function): void {
    if (!this.isCacheExpired(cacheExpirationKey + broadcastRecommendationsProgramsKey)) {
      const recommended = this.getDataFromCache(broadcastRecommendationsProgramsKey);
      if (recommended) {
        console.log('**Return broadcast recommendations data from cache.');
        cb(recommended);
      }
    }
    else {
      const url = this.localeService.getArchiveUrl() + broadcastRecommendationsProgramsMethod + '?' + dateParam + '=' + date + '&' + limitParam + '=' + limit
        + '&' + offsetParam + '=' + offset;

      console.log('Broadcast recommendations URL: ', url);

      this.runQuery(url, (data: any) => {
        if (data) {
          data = this.commonService.stringToJson(data);

          const rootProp = broadcastRecommendationsProgramsMethod.replace(get_, '');

          data = data[rootProp];
          data = this.filterResponse(data, broadcastRecommendationsProgramsMethod);

          if (data && data.length) {
            this.cacheData(broadcastRecommendationsProgramsKey, this.commonService.jsonToString(data));
          }

          cb(data);
        }
        else {
          cb(null);
        }
      });
    }
  }

  getNewestPrograms(date: string, limit: number, offset: number, category: any, cb: Function): void {
    let categoryId = '';
    if (category) {
      categoryId = category;
    }

    if (!this.isCacheExpired(cacheExpirationKey + newestProgramsKey + categoryId)) {
      const newest = this.getDataFromCache(newestProgramsKey + categoryId);
      if (newest) {
        console.log('**Return newest data from cache.');
        cb(newest);
      }
    }
    else {
      let url = this.localeService.getArchiveUrl() + newestProgramsMethod + '?' + dateParam + '=' + date + '&' + limitParam + '=' + limit
        + '&' + offsetParam + '=' + offset;

      if (category) {
        url += ('&' + categoryParam + '=' + category);
      }

      console.log('Newest URL: ', url);

      this.runQuery(url, (data: any) => {
        if (data) {
          data = this.commonService.stringToJson(data);

          const rootProp = newestProgramsMethod.replace(get_, '');

          data = data[rootProp];
          data = this.filterResponse(data, newestProgramsMethod);

          if (data && data.length) {
            this.cacheData(newestProgramsKey + categoryId, this.commonService.jsonToString(data));
          }

          cb(data);
        }
        else {
          cb(null);
        }
      });
    }
  }

  getMostViewedPrograms(archiveLanguage: string, cb: Function): void {
    if (!this.isCacheExpired(cacheExpirationKey + mostViewedProgramsKey)) {
      const mostViewed = this.getDataFromCache(mostViewedProgramsKey);
      if (mostViewed) {
        console.log('**Return most viewed data from cache.');
        cb(mostViewed);
      }
    }
    else {
      const url = this.localeService.getArchiveUrl() + mostViewedProgramsMethod + '?' + vodParam + '=' + archiveLanguage;

      console.log('Most viewed URL: ', url);

      this.runQuery(url, (data: any) => {
        if (data) {
          data = this.commonService.stringToJson(data);

          data = data[mostViewedProgramsMethod];
          data = this.filterResponse(data, mostViewedProgramsMethod);

          if (data && data.length) {
            this.cacheData(mostViewedProgramsKey, this.commonService.jsonToString(data));
          }

          cb(data);
        }
        else {
          cb(null);
        }
      });
    }
  }

  getParentCategories(cb: Function): void {
    const parentCategories = this.getDataFromCache(parentCategoriesKey);
    if (parentCategories && parentCategories.length) {
      console.log('**Return parent categories data from cache.');
      cb(parentCategories);
    }
    else {
      // Read sub categories to cache
      this.getSubCategories(() => { });

      const url = this.localeService.getArchiveUrl() + parentCategoriesMethod;

      console.log('Parent categories URL: ', url);

      this.runQuery(url, (data) => {
        if (data) {
          data = this.commonService.stringToJson(data);

          const rootProp = parentCategoriesMethod.replace(get_, '');

          data = data[rootProp];

          if (data && data.length) {
            this.cacheData(parentCategoriesKey, this.commonService.jsonToString(data));
          }

          cb(data);
        }
        else {
          cb(null);
        }
      });
    }
  }

  getSubCategories(cb: Function): void {
    const subCategories = this.getDataFromCache(subCategoriesKey);
    if (subCategories && subCategories.length) {
      console.log('**Return sub categories data from cache.');
      cb(subCategories);
    }
    else {
      const url = this.localeService.getArchiveUrl() + subCategoriesMethod;

      console.log('Sub categories URL: ', url);

      this.runQuery(url, (data: any) => {
        if (data) {
          data = this.commonService.stringToJson(data);

          const rootProp = subCategoriesMethod.replace(get_, '');

          data = data[rootProp];

          if (data && data.length) {
            this.cacheData(subCategoriesKey, this.commonService.jsonToString(data));
          }

          cb(data);
        }
        else {
          cb(null);
        }
      });
    }
  }

  getCategoryPrograms(categoryId: number, limit: number, offset: number, cb: Function): void {
    const url = this.localeService.getArchiveUrl() + categoryProgramsMethod + '?' + categoryIdParam + '=' + categoryId + '&' + limitParam + '=' + limit
      + '&' + offsetParam + '=' + offset;

    console.log('Category programs URL: ', url);

    this.runQuery(url, (data: any) => {
      if (data) {
        data = this.commonService.stringToJson(data);

        const rootProp = categoryProgramsMethod.replace(get_, '');

        data = data[rootProp];

        data = this.filterResponse(data, categoryProgramsMethod);

        cb(data);
      }
      else {
        cb(null);
      }
    });
  }

  getProgramInfo(programId: number, cb: Function): void {
    const url = this.localeService.getArchiveUrl() + programInfoMethod + '?' + programIdParam + '=' + programId;

    console.log('Program info URL: ', url);

    this.runQuery(url, (data: any) => {
      if (data) {
        data = this.commonService.stringToJson(data);

        const rootProp = programInfoMethod.replace(get_, '');

        data = data[rootProp];

        data = this.filterResponse(data, programInfoMethod);

        cb(data);
      }
      else {
        cb(null);
      }
    });
  }

  getSeriesInfo(seriesId: number, cb: Function): void {
    const url = this.localeService.getArchiveUrl() + seriesInfoMethod + '?' + seriesIdParam + '=' + seriesId;

    console.log('Series info URL: ', url);

    this.runQuery(url, (data: any) => {
      if (data) {
        data = this.commonService.stringToJson(data);

        const rootProp = seriesInfoMethod.replace(get_, '');

        data = data[rootProp];

        cb(data);
      }
      else {
        cb(null);
      }
    });
  }

  getSeriesPrograms(seriesId: number, limit: number, offset: number, cb: Function): void {
    const url = this.localeService.getArchiveUrl() + seriesProgramsMethod + '?' + seriesIdParam + '=' + seriesId + '&' + limitParam + '=' + limit
      + '&' + offsetParam + '=' + offset;

    console.log('Series programs URL: ', url);

    this.runQuery(url, (data: any) => {
      if (data) {
        data = this.commonService.stringToJson(data);

        const rootProp = seriesProgramsMethod.replace(get_, '');

        data = data[rootProp];

        data = this.filterResponse(data, seriesProgramsMethod);

        cb(data);
      }
      else {
        cb(null);
      }
    });
  }

  getTranslation(id: number, lang: string, cb: Function): void {
    const url = this.localeService.getArchiveUrl() + translationMethod + '?' + programIdParam + '=' + id;

    console.log('Translations URL: ', url);

    this.runQuery(url, (data) => {
      if (data) {
        data = this.commonService.stringToJson(data);

        const rootProp = translationMethod.replace(get_, '');

        data = data[rootProp];

        let tLang = null;
        for (let i = 0; i < data.length; i++) {
          if (data[i].lang_id && data[i].lang_id === lang) {
            tLang = data[i];
            break;
          }
        }

        cb({ lang: tLang });
      }
      else {
        cb(null);
      }
    });
  }

  searchPrograms(queryString: string, cb: Function): void {
    const archiveLanguage = this.localeService.getArchiveLanguage();

    const url = searchUrl + '?' + vodParam + '=' + archiveLanguage + '&' + queryParam + '=' + queryString;

    console.log('Search data URL: ', url);

    this.runQuery(url, (data) => {
      if (data) {
        data = this.commonService.stringToJson(data);

        const hitCount = data['hit_count'];
        data = this.filterResponse(data['results'], searchMethod);

        cb({ hit_count: hitCount, results: data });
      }
      else {
        cb(null);
      }
    });
  }

  runQuery(url: string, cb: Function): void {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = (e) => {
      //console.log('Response: ', xhttp.responseText);

      cb(xhttp.responseText);
    };

    xhttp.onerror = (e) => {
      //console.log('Network request failed: ', e);
      this.commonService.cacheValue(errorTextKey, networkRequestFailedText);

      cb(null);
    };

    xhttp.ontimeout = (e) => {
      //console.log('Network request timeout: ', e);
      xhttp.abort();

      this.commonService.cacheValue(errorTextKey, networkRequestTimeoutText);
      cb(null);
    }

    xhttp.timeout = 30000;
    xhttp.open('GET', url, true);
    xhttp.send();
  }

  cacheData(key: string, data: any): void {
    this.commonService.cacheValue(key, data);
    this.commonService.cacheValue(cacheExpirationKey + key, String(new Date().getTime()));
  }

  getDataFromCache(key: string): any {
    return this.commonService.stringToJson(this.commonService.getValueFromCache(key));
  }

  filterResponse(data: any, method: string): any {
    let result: any = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        let resultItem: any = {};
        let sourceItem: any = data[i];

        resultItem.id = sourceItem.id;
        resultItem.image_path = this.checkPropertyValue(sourceItem.image_path);
        resultItem.link_path = this.checkPropertyValue(sourceItem.link_path);
        resultItem.episode_number = this.checkPropertyValue(sourceItem.episode_number);

        resultItem.sid = this.checkPropertyValue(sourceItem.sid);
        resultItem.series_id = this.checkPropertyValue(sourceItem.series_id);
        resultItem.series_name = this.checkPropertyValue(sourceItem.series_name);

        const firstBroadcast = parseInt(sourceItem.first_broadcast ? sourceItem.first_broadcast : sourceItem.start_date);
        resultItem.broadcast_date_time = this.commonService.getDateTimeByTimeInMs(firstBroadcast);
        resultItem.broadcast_date = this.commonService.getDateByTimeInMs(firstBroadcast);
        resultItem.duration_time = this.commonService.getTimeStampByDuration(sourceItem.duration);

        resultItem.name_desc = '';
        let seriesName = this.checkPropertyValue(sourceItem.series_name);
        if (!seriesName) {
          seriesName = this.checkPropertyValue(sourceItem.sname);
        }

        if (seriesName) {
          resultItem.name_desc = seriesName;
        }

        let name = this.checkPropertyValue(sourceItem.name);
        if (seriesName && name && seriesName !== name) {
          resultItem.name_desc += (' | ' + name);
        }

        if (resultItem.name_desc === '') {
          resultItem.name_desc = name;
        }

        resultItem.caption = this.checkPropertyValue(sourceItem.caption);

        if (method === broadcastRecommendationsProgramsMethod || method === programInfoMethod) {
          if (sourceItem.is_visible_on_vod) {
            resultItem.is_visible_on_vod = this.checkPropertyValue(sourceItem.is_visible_on_vod);

            let visibleOnVodSince = this.checkPropertyValue(sourceItem.visible_on_vod_since);
            if (visibleOnVodSince && visibleOnVodSince.length) {
              visibleOnVodSince = parseInt(visibleOnVodSince);

              resultItem.is_visible_on_vod = this.commonService.isPastTime(visibleOnVodSince) ? '1' : '0';
            }
          }
          else {
            if (!sourceItem.visible_on_vod_since) {
              resultItem.is_visible_on_vod = '-1';
            }
          }

          if (sourceItem.visible_on_vod_since && sourceItem.duration) {
            const startTime = parseInt(sourceItem.visible_on_vod_since) - parseInt(sourceItem.duration);
            resultItem.broadcast_date_time = this.commonService.getDateTimeByTimeInMs(startTime);
          }
        }
        else {
          resultItem.is_visible_on_vod = '1';
        }

        if (method === seriesProgramsMethod) {
          resultItem.title_episode_number = this.localeService.getLocaleTextById('episodeText') + ': ' + resultItem.episode_number;
          resultItem.title_duration_time = this.localeService.getLocaleTextById('durationText') + ': ' + resultItem.duration_time;
          resultItem.title_broadcast_date_time = this.localeService.getLocaleTextById('firstBroadcastText') + ': ' + resultItem.broadcast_date_time;
        }

        if (method === searchMethod) {
          resultItem.type = this.checkPropertyValue(sourceItem.type);
        }

        if (method === programInfoMethod) {
          resultItem.path = this.checkPropertyValue(sourceItem.path);
          resultItem.aspect_ratio = this.checkPropertyValue(sourceItem.aspect_ratio);
        }

        if (method === newestProgramsMethod) {
          resultItem.cname = this.checkPropertyValue(sourceItem.cname);
          resultItem.cid = this.checkPropertyValue(sourceItem.cid);
        }

        result.push(resultItem);
      }
    }
    return result;
  }

  checkPropertyValue(property: any): any {
    return property && property !== '' && property !== nullValue ? property : null;
  }

  isCacheExpired(key: string): boolean {
    const cacheTime: string = this.commonService.getValueFromCache(key);
    if (cacheTime) {
      return (new Date().getTime() - Number(cacheTime)) > archiveCacheExpTimeMs;
    }
    else {
      return true;
    }
  }

  filterSubCategories(data: any, parentId: number): any {
    let filtered: any = [];
    if (data && parentId) {
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        if (item.parent_id === parentId) {
          filtered.push(item);
        }
      }
    }

    return filtered;
  }
}
