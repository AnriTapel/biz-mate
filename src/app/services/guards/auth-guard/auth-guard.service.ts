import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {filter, takeWhile} from "rxjs/operators";
import {User} from "../../../models/User";
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
  private userData: User = undefined;

  constructor(private router: Router, private dialog: MatDialog, private lazyLoadingService: LazyLoadingService,
              private authService: AuthService) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.previousUrl = event.url);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve) => {
      this.authService.credentials$.pipe(
        takeWhile(credentials => credentials === null),
      ).subscribe({
        complete: () => {
          let authReqPages = AuthGuardService.routesWithVerifiedUserRequired.filter(it => state.url.indexOf(it) > -1);
          if (!authReqPages.length) {
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
