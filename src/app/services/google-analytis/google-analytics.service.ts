import {Injectable} from '@angular/core';
import {Analytics, logEvent} from "@angular/fire/analytics";
import AppEventNames from "../../events/AppEventNames";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";
import {EventObserver} from "../event-observer/event-observer.service";
import {InitAuthEvent} from "../../events/InitAuthEvent";
import {InitDataEvent} from "../../events/InitDataEvent";

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor(private analytics: Analytics, private eventObserver: EventObserver) {
    console.log('GoogleAnalyticsService constructor');
    eventObserver.getEventObservable(AppEventNames.SEND_ANALYTICS).subscribe(this.sendAnalytics.bind(this));
    eventObserver.getEventObservable(AppEventNames.APP_ERROR).subscribe(this.onAppError.bind(this));
    eventObserver.getEventObservable(AppEventNames.INIT_APP_AUTH).subscribe(this.onInitAppAuthEvent.bind(this));
    eventObserver.getEventObservable(AppEventNames.INIT_APP_DATA).subscribe(this.onInitAppDataEvent.bind(this));
  }

  private sendAnalytics(event: GoogleAnalyticsEvent): void {
    console.debug('GoogleAnalyticsService.sendAnalytics', event);
    logEvent(this.analytics, event.analyticsEventName);
  }

  private onAppError(): void {
    logEvent(this.analytics, 'app_error');
  }

  private onInitAppAuthEvent(event: InitAuthEvent): void {
    if (!event.isSuccess) {
      logEvent(this.analytics, 'init_auth_error');
    }
  }

  private onInitAppDataEvent(event: InitDataEvent): void {
    if (!event.isSuccess) {
      logEvent(this.analytics, 'init_data_error');
    }
  }
}
