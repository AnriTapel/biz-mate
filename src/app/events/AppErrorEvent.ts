import AppEventNames from "./AppEventNames";
import AppCommonEvent from "./AppCommonEvent";

export class AppErrorEvent extends AppCommonEvent {

  detail: any;

  constructor(detail: any) {
    super(AppEventNames.APP_ERROR);
    this.detail = detail;
  }

}
