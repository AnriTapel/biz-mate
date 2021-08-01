import {OnDestroy} from "@angular/core";
import {User} from "./User";
import {AppService} from "../services/app/app.service";
import {AuthService} from "../services/auth/auth.service";

export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected metaTags: any;
  protected userAuthData: User;
  private isInitialSpinnerHidden: boolean = false;

  protected constructor(protected authService: AuthService) {
    this.userAuthData = authService.credentials;
  }

  ngOnDestroy(): void {
    AppService.scrollPageToHeader();
  }

  ngAfterViewChecked(): void {
    if (!this.isInitialSpinnerHidden) {
      AppService.hideInitialSpinner();
      this.isInitialSpinnerHidden = true;
    }
  }

  public isUserLoggedIn(): boolean {
    return !!this.userAuthData;
  }

  public getUserAuthData(): User {
    return this.userAuthData;
  }
}
