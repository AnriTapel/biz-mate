import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LazyLoadingService} from "../lazy-loading/lazy-loading.service";
import {EventObserver} from "../event-observer/event-observer.service";
import AppEventNames from "../../events/AppEventNames";
import {Observable} from "rxjs";
import {OpenDialogEvent} from "../../events/OpenDialogEvent";

@Injectable({
  providedIn: 'root'
})
export class DialogsService {

  private openDialogEventListener: Observable<OpenDialogEvent>;

  constructor(private dialog: MatDialog, private lazyLoadingService: LazyLoadingService, private eventObserver: EventObserver) {
    this.openDialogEventListener = this.eventObserver.getEventObservable(AppEventNames.OPEN_DIALOG);
    this.openDialogEventListener.subscribe((event: OpenDialogEvent) => {
      this.onOpenDialogEvent(event);
    });
  }

  private async onOpenDialogEvent(event: OpenDialogEvent): Promise<void> {
    const component = await this.lazyLoadingService.getDialogComponent(event.dialogModuleName);
    const dialogRef = this.dialog.open(component, event.dialogConfig);
    if (event.beforeClosedCallback) {
      dialogRef.beforeClosed().subscribe((res) => {
        event.beforeClosedCallback(res);
      });
    }
  }
}
