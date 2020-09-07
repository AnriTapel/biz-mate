import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../dialogs/login/login.component";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {AppService} from "../../services/app/app.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public loggedIn: boolean;
  public userName: string;

  constructor(private dialog: MatDialog, private auth: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.hideMobileMenu();
    this.auth.user$.subscribe((res) => {
      this.loggedIn = res && !res.isAnonymous;
      this.userName = this.loggedIn ? res.displayName : undefined;
    });
  }

  onAuthButtonClick(): void {
    if (this.loggedIn) {
      this.logOut();
    } else {
      this.openLoginDialog();
    }
  }

  openLoginDialog(): void {
    this.dialog.open(LoginComponent, MatDialogConfig.narrowDialogWindow);
    this.hideMobileMenu();
  }

  showMobileMenu(): void {
    document.getElementById('mobileMenuWrapper').style.visibility = 'visible';
    document.getElementById('mobileMenuWrapper').style.opacity = '1';
  }

  hideMobileMenu(): void {
    document.getElementById('mobileMenuWrapper').style.visibility = 'hidden';
    document.getElementById('mobileMenuWrapper').style.opacity = '0';
  }

  logOut(): void {
    AppService.showOverlay();
    this.auth.signOut().then(() => {
      this.auth.user = null;
      this.router.navigateByUrl("/");
      this.hideMobileMenu();
    }).finally(() => AppService.hideOverlay());
  }
}
