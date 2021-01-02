import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../dialogs/login/login.component";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {OverlayService} from "../../services/overlay/overlay.service";
import {UserSubscriptionsService} from "../../services/user-subscriptions/user-subscriptions.service";

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
  }

  ngOnInit(): void {
    this.hideMobileMenu();
    this.auth.user$.subscribe((res) => {
      this.loggedIn = res && !res.isAnonymous;
      this.userName = this.loggedIn ? res.displayName : undefined;
    });
  }

  public onAuthButtonClick(): void {
    if (this.loggedIn) {
      this.logOut();
    } else {
      this.openLoginDialog();
    }
  }

  public openLoginDialog(): void {
    this.dialog.open(LoginComponent, MatDialogConfig.narrowDialogWindow);
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
