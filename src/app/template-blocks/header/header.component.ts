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

  loggedIn: boolean;

  constructor(private dialog: MatDialog, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.auth.user$.subscribe((res) => {
      if (res && !res.isAnonymous) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    })
  }

  onAuthButtonClick(): void {
    if (this.loggedIn) {
      this.logOut();
    } else {
      this.openLoginDialog();
    }
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, MatDialogConfig.narrowDialogWindow);

    dialogRef.afterClosed().subscribe(() => {
      console.log('Login dialog was closed');
    });
  }

  logOut(): void {
    AppService.showOverlay();
    this.auth.signOut().then(() => {
      this.auth.user = null;
      this.router.navigateByUrl("/");
    }).finally(() => AppService.hideOverlay());
  }
}
