import {OnDestroy} from "@angular/core";
import {User} from "./User";
import AppEventNames from "../events/AppEventNames";
import {AppService} from "../services/app/app.service";

export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected userAuthData: User = undefined;
  protected authEventListeners: Map<string, Function> = new Map([
    [AppEventNames.AUTH_STATE_RESPONSE, this.onAuthStateEvent.bind(this)],
    [AppEventNames.AUTH_STATE_CHANGED, this.onAuthStateEvent.bind(this)]
  ]);

  protected constructor() {
    //@ts-ignore
    ym(65053642, 'hit', location.href);
    for (let [key, handler] of this.authEventListeners) {
      //@ts-ignore
      document.addEventListener(key, handler);
    }
    document.dispatchEvent(new Event(AppEventNames.AUTH_STATE_REQUEST));
  }

  ngOnDestroy(): void {
    AppService.scrollPageToHeader();

    for (let [key, handler] of this.authEventListeners) {
      //@ts-ignore
      document.removeEventListener(key, handler);
    }
  }

  private onAuthStateEvent(user: CustomEvent): void {
    this.userAuthData = user.detail;
  }

  public isUserLoggedIn(): boolean {
    return !!this.userAuthData;
  }

  public getUserAuthData(): User {
    return this.userAuthData;
  }
}
