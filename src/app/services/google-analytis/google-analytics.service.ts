import { Injectable } from '@angular/core';
import {AngularFireAnalytics} from "@angular/fire/analytics";
import AppEventNames from "../../events/AppEventNames";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor(private analytics: AngularFireAnalytics) {
    document.addEventListener(AppEventNames.SEND_ANALYTICS, this.sendAnalytics.bind(this));
    document.addEventListener(AppEventNames.APP_ERROR, this.onAppError.bind(this));
    document.addEventListener(AppEventNames.APP_INIT_ERROR, this.onAppError.bind(this));
  }

  private sendAnalytics(event: GoogleAnalyticsEvent): void {
    this.analytics.logEvent(event.eventName);
  }

  private onAppError(): void {
    this.analytics.logEvent('app_error');
  }
}
