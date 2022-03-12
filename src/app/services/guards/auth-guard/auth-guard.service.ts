import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {filter, takeWhile} from "rxjs/operators";
import {BizMateUser} from "../../../models/BizMateUser";
import {LazyLoadingService} from "../../lazy-loading/lazy-loading.service";
import {DialogConfigType, MatDialogConfig} from "../../../dialogs/mat-dialog-config";
import {AppService} from "../../app/app.service";
import {AuthService} from "../../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  static readonly routesWithVerifiedUserRequired: string[] = ["/new-offer", "/edit-offer/", "/profile"];

  private previousUrl: string;
  private dialogHandler: any = undefined;
  private userData: BizMateUser = undefined;

  constructor(private router: Router, private dialog: MatDialog, private lazyLoadingService: LazyLoadingService,
              private authService: AuthService) {
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
            this.lazyLoadingService.getLazyLoadedComponent(LazyLoadingService.LOGIN_MODULE_NAME)
              .then(comp => {
                let loginDialogRef = this.dialog.open(comp, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {redirectUrl: state.url}));
                this.dialogHandler = loginDialogRef.afterClosed().subscribe(() => {
                  if (!this.userData) {
                    if (!this.previousUrl) {
                      this.router.navigateByUrl('/');
                    }
                  }
                  AppService.unsubscribeHandler([this.dialogHandler]);
                });
                AppService.hideInitialSpinner();
              });
            resolve(false);
            return;
          }
          resolve(true);
        }
      });
    });
  }
}
