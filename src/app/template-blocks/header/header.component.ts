import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../dialogs/login/login.component";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  loggedIn: boolean;
  authControlText: string;
  visibleMenu: boolean = false;

  constructor(private dialog: MatDialog, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.auth.user$.subscribe((res) => {
      if (res) {
        this.loggedIn = true;
        this.authControlText = this.auth.user.displayName.substr(0, 1);
      } else {
        this.loggedIn = false;
        this.authControlText = 'Вход/Регистрация'
      }
    })
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, MatDialogConfig.narrowDialogWindow);

    dialogRef.afterClosed().subscribe(() => {
      console.log('Login dialog was closed');
    });
  }

  openProfile(): void {
    this.router.navigateByUrl('/profile');
  }

  logOut(): void {
    this.visibleMenu = false;
    this.auth.signOut().then((res) => {
      this.auth.user = null;
      this.router.navigateByUrl("/");
    })
  }
}
