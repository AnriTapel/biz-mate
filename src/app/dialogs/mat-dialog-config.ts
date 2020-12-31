export enum DialogConfigType {
  NARROW_CONFIG = 0,
  WIDE_CONFIG = 1
}

export class MatDialogConfig {

  static readonly narrowDialogWindow = {
    width: '90vw',
    maxWidth: '400px',
    minWidth: '200px',
    maxHeight: '98vh',
    autoFocus: false,
    backdropClass: 'dialog-backdrop',
    panelClass: 'dialog-content',
    closeOnNavigation: true
  };

  static readonly  wideDialogWindow = {
    width: '90vw',
    maxWidth: '1020px',
    minWidth: '200px',
    maxHeight: '98vh',
    autoFocus: false,
    backdropClass: 'dialog-backdrop',
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
