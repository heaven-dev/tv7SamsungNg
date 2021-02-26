import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private selectedSidebarIcon = new Subject<string>();
    selectedSidebar$ = this.selectedSidebarIcon.asObservable();

    selectSidebarIcon(value: string) {
        this.selectedSidebarIcon.next(value);
    }
}
