import AppEventNames from "./AppEventNames";
import AppCommonEvent from "./AppCommonEvent";

export class InitDataEvent extends AppCommonEvent {

  isSuccess: boolean;

  constructor(success: boolean = true) {
    super(AppEventNames.INIT_APP_DATA);
    this.isSuccess = success;
  }

}
