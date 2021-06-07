import {OnDestroy} from "@angular/core";
import {User} from "./User";
import {AppService} from "../services/app/app.service";
import {AuthService} from "../services/auth/auth.service";

export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected metaTags: any;
  protected userAuthData: User;

  protected constructor(protected authService: AuthService) {
    //@ts-ignore
    ym(65053642, 'hit', location.href);
    this.userAuthData = authService.credentials;
  }

  ngOnDestroy(): void {
    AppService.scrollPageToHeader();
  }

  public isUserLoggedIn(): boolean {
    return !!this.userAuthData;
  }

  public getUserAuthData(): User {
    return this.userAuthData;
  }
}
