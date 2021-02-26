import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { LocaleService } from './locale.service';
import { guideMethod, dateParam, get_ } from '../helpers/constants';

@Injectable({
    providedIn: 'root'
})
export class ProgramScheduleService {

    constructor(
        private commonService: CommonService,
        private localeService: LocaleService
    ) { }

    getGuideByDate(date: string, cb: Function): any {
        const url = this.localeService.getArchiveUrl() + guideMethod + '?' + dateParam + '=' + date;

        console.log('Guide by date URL: ', url);

        this.runGuideByDateQuery(url, (data) => {
            data = this.commonService.stringToJson(data);

            const rootProp = guideMethod.replace(get_, '');

            data = data[rootProp];

            const currentTime = Date.now();

            let ongoingProgramIndex = 0;
            for (let i = 0; i < data.length; i++) {
                let item = data[i];

                const time = Number(item.time);
                const endTime = Number(item.end_time);

                item.time = time;
                item.endTime = endTime;
                item.duration = endTime - time;

                item.localStartTime = this.getLocalTimeByUtcTime(time);
                item.localEndTime = this.getLocalTimeByUtcTime(endTime);

                item.startEndLocal = item.localStartTime + ' - ' + item.localEndTime;

                item.localStartDate = this.getLocalDateByUtcTime(time);
                item.localEndDate = this.getLocalDateByUtcTime(endTime);

                item.duration_time = this.commonService.getTimeStampByDuration(item.duration);
                item.broadcast_date_time = this.commonService.getDateTimeByTimeInMs(time);

                let nameDesc = item.series;
                let name = item.name;
                if (nameDesc && nameDesc.length && name && name.length) {
                    nameDesc += (' | ' + name);
                }

                if (!nameDesc || nameDesc.length === 0) {
                    nameDesc = name;
                }

                item.name_desc = nameDesc;

                if (item.is_visible_on_vod && item.visible_on_vod_since) {
                    item.is_visible_on_vod = this.commonService.isPastTime(parseInt(item.visible_on_vod_since)) ? '2' : '0';
                }
                else {
                    item.is_visible_on_vod = '-1';
                }

                const s = new Date(time).getTime();
                const e = new Date(endTime).getTime();

                if ((currentTime >= s && currentTime <= e) || e < currentTime) {
                    ongoingProgramIndex = i;
                }
            }

            cb({ ongoingProgramIndex: ongoingProgramIndex, data: data });
        });
    }

    runGuideByDateQuery(url: string, cb: Function): any {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                cb(xhttp.responseText);
            }
        };
        xhttp.open('GET', url, true);
        xhttp.send();
    }

    getProgramByIndex(data: any, index: number): any {
        console.log('getProgramByIndex(): data.length: ', data.length, ' index: ', index);

        let p: any = {};

        if (data) {
            const current = this.getUtcTimeStamp();

            const ongoingIndex = this.getOngoingProgramIndex(data);
            console.log('Ongoing program index: ', ongoingIndex);

            p = data[ongoingIndex + index];
            if (p) {
                let start = Number(p.time);

                p.isStartDateToday = this.isStartDateToday(start);

                if (index === 0) {
                    // calculate status bar percent

                    p.passed = current - new Date(start).getTime();
                    p.passedPercent = this.validatePercentValue(Math.round(p.passed / p.duration * 100));
                }
            }
        }

        return p;
    }

    isInIndex(data: any, index: number): boolean {
        index = this.getOngoingProgramIndex(data) + index;
        const p = data[index];
        return p ? true : false;
    }

    isOngoingProgram(data: any, index: number): boolean {
        const currentUtcTime = this.getUtcTimeStamp();
        index = this.getOngoingProgramIndex(data) + index;

        const p = data[index];

        if (p) {
            const s = new Date(p.time).getTime();
            const e = new Date(p.endTime).getTime();

            if (currentUtcTime >= s && currentUtcTime <= e) {
                return true;
            }
        }
        return false;
    }

    getOngoingAndComingPrograms(data: any, count: number): any {
        let retData = [];

        const current = this.getUtcTimeStamp();
        const index = this.getOngoingProgramIndex(data);

        for (let i = index; i < data.length; i++) {
            // If count is null => take all
            if (count != null && retData.length === count) {
                break;
            }

            const p = data[i];

            if (p) {
                const start = p.time;

                p.isStartDateToday = this.isStartDateToday(start);

                if (i === index) {
                    // calculate status bar percent
                    p.passed = current - new Date(start).getTime();
                    p.passedPercent = this.validatePercentValue(Math.round(p.passed / p.duration * 100));
                }

                retData.push(p);
            }
        }
        return retData;
    }

    validatePercentValue(value: number): number {
        if (value < 0) {
            value = 0;
        }

        if (value > 100) {
            value = 100;
        }

        return value;
    }

    getOngoingProgramIndex(data: any): number {
        let index = 0;

        const currentUtcTime = this.getUtcTimeStamp();
        for (let i = 0; data && i < data.length; i++) {
            const p = data[i];

            if (p) {
                const s = new Date(Number(p.time)).getTime();
                const e = new Date(Number(p.endTime)).getTime();

                if ((currentUtcTime >= s && currentUtcTime <= e) || e < currentUtcTime) {
                    index = i;
                }
            }
        }

        return index;
    }

    getGuideData(data: any, startIndex: number, count: number): any {
        let retData = [];

        const index = this.getOngoingProgramIndex(data) + startIndex;

        let p = null;
        for (let i = index; i < data.length; i++) {
            if (retData.length === count) {
                break;
            }

            p = data[i];

            if (p) {
                p.isStartDateToday = this.isStartDateToday(p.time);

                retData.push(p);
            }
        }
        return retData;
    }

    getUtcTimeStamp(): number {
        return new Date().getTime();
    }

    isStartDateToday(time: number): boolean {
        if (time) {
            const d = this.commonService.getLocalDateByUtcTimestamp(time);
            const t = new Date();
            return t.getDate() === d.getDate() && t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear();
        }
        return false;
    }

    getLocalDateTime(): string {
        const d = new Date();

        return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + '  '
            + this.commonService.prependZero(d.getHours()) + ':' + this.commonService.prependZero(d.getMinutes());
    }


    getLocalDateByUtcTime(time: number): string {
        if (time > 0) {
            const d = this.commonService.getLocalDateByUtcTimestamp(time);
            return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
        }
        return '';
    }

    getLocalTimeByUtcTime(time: number): string {
        if (time > 0) {
            const d = this.commonService.getLocalDateByUtcTimestamp(time);

            return this.commonService.prependZero(d.getHours()) + ':' + this.commonService.prependZero(d.getMinutes());
        }
        return '';
    }
}
