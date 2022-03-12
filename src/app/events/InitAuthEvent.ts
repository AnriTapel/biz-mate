import AppEventNames from "./AppEventNames";
import AppCommonEvent from "./AppCommonEvent";

export class InitAuthEvent extends AppCommonEvent {

  isSuccess: boolean;

  constructor(success: boolean = true) {
    super(AppEventNames.INIT_APP_AUTH);
    this.isSuccess = success;
  }

}
