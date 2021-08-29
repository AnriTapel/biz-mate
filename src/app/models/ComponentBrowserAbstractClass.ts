import {OnDestroy} from "@angular/core";
import {User} from "./User";
import {AppService} from "../services/app/app.service";
import {AuthService} from "../services/auth/auth.service";
import {Subscription} from "rxjs";

export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected metaTags: any;
  protected userAuthData: User;
  private static isInitialSpinnerHidden: boolean = false;
  private readonly userAuthDataHandler: Subscription;

  protected constructor(protected authService: AuthService) {
    this.userAuthDataHandler = authService.credentials$.subscribe((user: User) => {
      this.userAuthData = user;
    });
  }

  ngOnDestroy(): void {
    AppService.unsubscribeHandler([this.userAuthDataHandler]);
    AppService.scrollPageToHeader();
  }

  ngAfterViewChecked(): void {
    if (!ComponentBrowserAbstractClass.isInitialSpinnerHidden) {
      AppService.hideInitialSpinner();
      ComponentBrowserAbstractClass.isInitialSpinnerHidden = true;
    }
  }

  public isUserLoggedIn(): boolean {
    return !!this.userAuthData;
  }

  public getUserAuthData(): User {
    return this.userAuthData;
  }
}
