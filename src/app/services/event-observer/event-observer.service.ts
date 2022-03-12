import {Injectable} from '@angular/core';
import AppCommonEvent from "../../events/AppCommonEvent";
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class EventObserver {

  private observablesObj: Map<string, Subject<any>> = new Map<string, Subject<any>>();

  constructor() {}

  public getEventObservable(eventName: string): Observable<any>{
    if (!this.observablesObj.has(eventName)) {
      this.observablesObj.set(eventName, new Subject());
    }
    return this.observablesObj.get(eventName);
  }

  public dispatchEvent(event: AppCommonEvent): void {
    this.observablesObj.get(event.eventName)?.next(event);
  }

  public detachEventObservable(eventName: string): void {
    if (this.observablesObj.has(eventName)) {
      this.observablesObj.get(eventName).complete();
      this.observablesObj.delete(eventName);
    }
  }
}

