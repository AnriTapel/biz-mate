import AppEventNames from "./AppEventNames";
import AppCommonEvent from "./AppCommonEvent";

export class GoogleAnalyticsEvent extends AppCommonEvent {

  analyticsEventName: string;

  constructor(analyticsEventName: string) {
    super(AppEventNames.SEND_ANALYTICS);
    this.analyticsEventName = analyticsEventName;
  }

}
