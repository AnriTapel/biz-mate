import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {filter, takeWhile} from "rxjs/operators";
import {BizMateUser} from "../../../models/BizMateUser";
import {DialogConfigType, MatDialogConfig} from "../../../dialogs/MatDialogConfig";
import {AppService} from "../../app/app.service";
import {AuthService} from "../../auth/auth.service";
import {DialogModuleNames} from "../../../dialogs/DialogModuleNames";
import {EventObserver} from "../../event-observer/event-observer.service";
import {OpenDialogEvent} from "../../../events/OpenDialogEvent";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  static readonly routesWithVerifiedUserRequired: string[] = ["/new-offer", "/edit-offer/", "/profile"];

  private previousUrl: string;
  private userData: BizMateUser = undefined;

  constructor(private router: Router, private eventObserver: EventObserver, private authService: AuthService) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.previousUrl = event.url);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (state.url === '/' || state.url === '') {
      return true;
    }
    return new Promise((resolve) => {
      this.authService.credentials$.pipe(
        takeWhile(credentials => credentials === null),
      ).subscribe({
        complete: () => {
          if (!AuthGuardService.routesWithVerifiedUserRequired.some(it => state.url.indexOf(it) > -1)) {
            resolve(true);
            return;
          }
          const credentials = this.authService.credentials;
          if (credentials.isAnonymous) {
            const beforeCloseFunc = () => {
              if (!this.userData) {
                if (!this.previousUrl) {
                  this.router.navigateByUrl('/');
                }
              }
            };

            this.eventObserver.dispatchEvent(new OpenDialogEvent(DialogModuleNames.LOGIN_MODULE_NAME,
              MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {redirectUrl: state.url}),
              beforeCloseFunc.bind(this)
            ));
            AppService.hideInitialSpinner();
            resolve(false);
            return;
          }
          resolve(true);
        }
      });
    });
  }
}
