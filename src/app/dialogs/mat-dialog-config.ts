export enum DialogConfigType {
  NARROW_CONFIG = 0,
  WIDE_CONFIG = 1
}

export class MatDialogConfig {

  static readonly narrowDialogWindow = {
    width: '50vw',
    maxWidth: '400px',
    minWidth: '200px',
    maxHeight: '90vh',
    autoFocus: true,
    backdropClass: 'dialog-backdrop',
    panelClass: 'dialog-content',
    closeOnNavigation: true
  };

  static readonly  wideDialogWindow = {
    width: '80vw',
    maxWidth: '1020px',
    minWidth: '400px',
    maxHeight: '90vh',
    autoFocus: true,
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
