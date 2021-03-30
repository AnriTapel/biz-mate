import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "../../auth/auth.service";
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../../dialogs/login/login.component";
import {DialogConfigType, MatDialogConfig} from "../../../dialogs/mat-dialog-config";
import {filter} from "rxjs/operators";
import {AppService} from "../../app/app.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  private previousUrl: string;
  private dialogHandler: any = undefined;

  constructor(private router: Router, private authService: AuthService, private dialog: MatDialog) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.previousUrl = event.url);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.user) {
      return true;
    }
    let loginDialogRef = this.dialog.open(LoginComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {redirectUrl: state.url}));
    this.dialogHandler = loginDialogRef.afterClosed().subscribe(() => {
      if (!this.authService.user) {
        if (!this.previousUrl) {
          this.router.navigateByUrl('/');
        }
      }
      AppService.unsubscribeHandler([this.dialogHandler]);
    });
    return false;
  }
}
