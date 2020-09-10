import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  private static _isVisible: boolean = false;

  constructor() { }

  public static showOverlay(): void {
    this._isVisible = true;
  }

  public static hideOverlay(): void {
    this._isVisible = false;
  }

  static get isOverlayVisible(): boolean {
    return this._isVisible;
  }
}
