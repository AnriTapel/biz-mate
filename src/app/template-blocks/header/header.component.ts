import { Component, OnInit } from '@angular/core';
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
  public isMobileMenuOpened: boolean;
  public userName: string;

  constructor(private dialog: MatDialog, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.isMobileMenuOpened = false;
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
    this.isMobileMenuOpened = false;
  }

  logOut(): void {
    AppService.showOverlay();
    this.auth.signOut().then(() => {
      this.auth.user = null;
      this.router.navigateByUrl("/");
      this.isMobileMenuOpened = false;
    }).finally(() => AppService.hideOverlay());
  }
}
