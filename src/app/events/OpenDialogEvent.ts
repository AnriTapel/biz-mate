import AppEventNames from "./AppEventNames";
import AppCommonEvent from "./AppCommonEvent";
import {DialogModuleNames} from "../dialogs/DialogModuleNames";
import {MatDialogConfig} from "@angular/material/dialog";

export class OpenDialogEvent extends AppCommonEvent {

  dialogModuleName: DialogModuleNames;
  dialogConfig: MatDialogConfig;
  beforeClosedCallback: Function;

  constructor(dialogModuleName: DialogModuleNames, dialogConfig: MatDialogConfig, beforeClosedCallback?: Function) {
    super(AppEventNames.OPEN_DIALOG);
    this.dialogModuleName = dialogModuleName;
    this.dialogConfig = dialogConfig;
    this.beforeClosedCallback = beforeClosedCallback;
  }

}
