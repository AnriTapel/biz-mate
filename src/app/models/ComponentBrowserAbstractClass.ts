import { OnDestroy, Directive } from "@angular/core";
import {BizMateUser} from "./BizMateUser";
import {AppService} from "../services/app/app.service";
import {AuthService} from "../services/auth/auth.service";
import {Subscription} from "rxjs";

@Directive()
export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected metaTags: any;
  protected userAuthData: BizMateUser;
  private readonly userAuthDataHandler: Subscription;

  protected constructor(protected authService: AuthService) {
    this.userAuthDataHandler = authService.credentials$.subscribe((user: BizMateUser) => {
      this.userAuthData = user;
    });
  }

  ngOnDestroy(): void {
    AppService.unsubscribeHandler([this.userAuthDataHandler]);
  }

  ngAfterViewChecked(): void {
    AppService.hideInitialSpinner();
  }

  public isUserLoggedIn(): boolean {
    return !!this.userAuthData;
  }

  public getUserAuthData(): BizMateUser {
    return this.userAuthData;
  }
}
