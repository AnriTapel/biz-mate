import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {filter} from "rxjs/operators";
import {User} from "../../../models/User";
import AppEventNames from "../../../events/AppEventNames";
import {LazyLoadingService} from "../../lazy-loading/lazy-loading.service";
import {DialogConfigType, MatDialogConfig} from "../../../dialogs/mat-dialog-config";
import {AppService} from "../../app/app.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  private previousUrl: string;
  private dialogHandler: any = undefined;
  private userData: User = undefined;

  constructor(private router: Router, private dialog: MatDialog, private lazyLoadingService: LazyLoadingService) {
    document.addEventListener(AppEventNames.AUTH_STATE_RESPONSE, this.onAuthStateInfo.bind(this));
    document.addEventListener(AppEventNames.AUTH_STATE_CHANGED, this.onAuthStateInfo.bind(this));
    document.dispatchEvent(new Event(AppEventNames.AUTH_STATE_REQUEST));
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.previousUrl = event.url);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.userData) {
      return true;
    }

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
      }).catch(console.error);
    return false;
  }

  private onAuthStateInfo(event: CustomEvent): void {
    this.userData = event.detail;
  }
}
