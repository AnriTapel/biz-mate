import { OnDestroy, Directive } from "@angular/core";
import {User} from "./User";
import {AppService} from "../services/app/app.service";
import {AuthService} from "../services/auth/auth.service";
import {Subscription} from "rxjs";

@Directive()
export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected metaTags: any;
  protected userAuthData: User;
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
    AppService.hideInitialSpinner();
  }

  public isUserLoggedIn(): boolean {
    return !!this.userAuthData;
  }

  public getUserAuthData(): User {
    return this.userAuthData;
  }
}
