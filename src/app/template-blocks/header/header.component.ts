import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../dialogs/login/login.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {OverlayService} from "../../services/overlay/overlay.service";
import {UserSubscriptionsService} from "../../services/user-subscriptions/user-subscriptions.service";
import AppEventNames from "../../events/AppEventNames";
import {User} from "../../models/User";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public loggedIn: boolean;
  public userName: string;

  constructor(private dialog: MatDialog, private auth: AuthService, private router: Router,
              private userSubscriptionsService: UserSubscriptionsService) {

    document.addEventListener(AppEventNames.AUTH_STATE_RESPONSE, this.onAuthStateChange.bind(this));
    document.addEventListener(AppEventNames.AUTH_STATE_CHANGED, this.onAuthStateChange.bind(this));
  }

  ngOnInit(): void {
    this.hideMobileMenu();
    document.dispatchEvent(new Event(AppEventNames.AUTH_STATE_REQUEST));
  }

  public onAuthButtonClick(): void {
    if (this.loggedIn) {
      this.logOut();
    } else {
      this.openLoginDialog();
    }
  }

  private onAuthStateChange(info: CustomEvent): void {
    let user = info.detail;
    this.loggedIn = !!user;
    this.userName = user ? user.displayName : undefined;
  }

  public openLoginDialog(): void {
    this.dialog.open(LoginComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {redirectUrl: '/profile'}));
    this.hideMobileMenu();
  }

  public onNotificationButtonClick(): void {
    this.userSubscriptionsService.showNewOffersSubscriptionDialog();
  }

  public showMobileMenu(): void {
    document.getElementById('mobileMenuWrapper').style.visibility = 'visible';
    document.getElementById('mobileMenuWrapper').style.opacity = '1';
  }

  public hideMobileMenu(): void {
    document.getElementById('mobileMenuWrapper').style.visibility = 'hidden';
    document.getElementById('mobileMenuWrapper').style.opacity = '0';
  }

  public logOut(): void {
    OverlayService.showOverlay();
    this.auth.signOut().then(() => {
      this.router.navigateByUrl("/");
      this.hideMobileMenu();
    }).finally(() => OverlayService.hideOverlay());
  }
}
