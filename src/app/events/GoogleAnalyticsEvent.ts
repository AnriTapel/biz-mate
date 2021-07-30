import AppEventNames from "./AppEventNames";

export class GoogleAnalyticsEvent extends Event {

  eventName: string;

  constructor(eventName: string) {
    super(AppEventNames.SEND_ANALYTICS);
    this.eventName = eventName;
  }

}
