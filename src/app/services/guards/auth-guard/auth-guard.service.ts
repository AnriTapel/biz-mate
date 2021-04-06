import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../../dialogs/login/login.component";
import {DialogConfigType, MatDialogConfig} from "../../../dialogs/mat-dialog-config";
import {filter} from "rxjs/operators";
import {AppService} from "../../app/app.service";
import {User} from "../../../models/User";
import AppEventNames from "../../../events/AppEventNames";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  private previousUrl: string;
  private dialogHandler: any = undefined;
  private userData: User = undefined;

  constructor(private router: Router, private dialog: MatDialog) {
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
    let loginDialogRef = this.dialog.open(LoginComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {redirectUrl: state.url}));
    this.dialogHandler = loginDialogRef.afterClosed().subscribe(() => {
      if (!this.userData) {
        if (!this.previousUrl) {
          this.router.navigateByUrl('/');
        }
      }
      AppService.unsubscribeHandler([this.dialogHandler]);
    });
    return false;
  }

  private onAuthStateInfo(event: CustomEvent): void {
    this.userData = event.detail;
  }
}
