import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationBarService {

  private static NOTIFICATION_BAR_TIMEOUT_MSEC: number = 3000;
  private _isVisible: boolean = false;
  private _message: string = null;
  private _isSuccess: boolean = true;

  private timer: number;

  constructor() { }

  public showNotificationBar(message: string, isSuccess: boolean): void {
    this.isSuccess = isSuccess;
    this.message = message;
    this.isVisible = true;
    scroll(0,0);

    this.timer = setTimeout(() => {
      this.hideNotificationBar();
    }, NotificationBarService.NOTIFICATION_BAR_TIMEOUT_MSEC);
  }

  public hideNotificationBar(): void {
    clearTimeout(this.timer);
    this.isVisible = false;
    this.message = null;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  set isVisible(value: boolean) {
    this._isVisible = value;
  }

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  set isSuccess(value: boolean) {
    this._isSuccess = value;
  }
}
