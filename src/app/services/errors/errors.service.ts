import {Injectable} from '@angular/core';
import AppEventNames from "../../events/AppEventNames";
import {AngularFireFunctions} from "@angular/fire/functions";

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  constructor(private functions: AngularFireFunctions) {
    document.addEventListener(AppEventNames.APP_ERROR, this.sendError.bind(this));
  }

  public static dispatchEvent(event: string, detail: any): void {
    document.dispatchEvent(new CustomEvent(event, {detail}));
  }

  private async sendError(evt: CustomEvent): Promise<void> {
    if (!evt.detail || (!evt.detail.anchor && !evt.detail.error)) {
      return;
    }

    try {
      let func = this.functions.httpsCallable('logError');
      func({anchor: evt.detail.anchor || '', error: evt.detail.error || ''});
    } catch (e) {
      console.error('ErrorService.sendError error', e);
    }
  }
}
