import {config} from "rxjs";

export enum DialogConfigType {
  NARROW_CONFIG = 0,
  WIDE_CONFIG = 1
}

export class MatDialogConfig {

  static readonly narrowDialogWindow = {
    width: '50vw',
    maxWidth: '770px',
    minWidth: '320px',
    maxHeight: '90vh',
    autoFocus: true,
    panelClass: 'dialog-content',
    closeOnNavigation: true
  };

  static readonly  wideDialogWindow = {
    width: '80vw',
    maxWidth: '1020px',
    minWidth: '480px',
    maxHeight: '90vh',
    autoFocus: true,
    panelClass: 'dialog-content',
    closeOnNavigation: true
  };

  static getConfigWithData(configType: DialogConfigType, data: any): any {
    const config = configType === DialogConfigType.NARROW_CONFIG ? this.narrowDialogWindow : this.wideDialogWindow;

    let configClone = JSON.parse(JSON.stringify(config));
    configClone['data'] = data;
    return configClone;
  }
}
