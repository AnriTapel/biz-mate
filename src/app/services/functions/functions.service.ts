import {Injectable} from '@angular/core';
import AppEventNames from "../../events/AppEventNames";
import {Functions, httpsCallable} from "@angular/fire/functions";
import {EventObserver} from "../event-observer/event-observer.service";
import {AppErrorEvent} from "../../events/AppErrorEvent";

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  constructor(private functions: Functions, private eventObserver: EventObserver) {
    this.eventObserver.getEventObservable(AppEventNames.APP_ERROR).subscribe(this.onAppErrorEvent.bind(this));
  }

  private onAppErrorEvent(event: AppErrorEvent): void {
    try {
      console.error(event.detail);
      // toPromise().then() is for callable function to work \_O_/
      httpsCallable(this.functions, 'logError')({anchor: event.detail.anchor || '', error: event.detail.error || ''});
    } catch (e) {
      console.error('ErrorService.sendError error', e);
    }
  }
}
