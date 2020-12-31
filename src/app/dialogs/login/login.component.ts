import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SignUpComponent} from "../sign-up/sign-up.component";
import {MatDialogConfig} from "../mat-dialog-config";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ResetPasswordComponent} from "../reset-password/reset-password.component";
import {Messages} from "../../models/Messages";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hidePassword: boolean = true;
  loginFormGroup: FormGroup;
  errorMessage: string = null;

  constructor(private auth: AuthService, private dialog: MatDialog, private dialogRef: MatDialogRef<LoginComponent>, private router: Router) {
    this.loginFormGroup = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });

    this.loginFormGroup.valueChanges.subscribe(() => this.errorMessage = null);
  }

  ngOnInit(): void {
  }

  public onKeyPress(event): void {
    if (event.which == 13 || event.keyCode == 13) {
      this.logIn();
    }
  }

  public logIn() {
    if (!this.loginFormGroup.valid) {
      return;
    }

    const credentials = {
      login: this.loginFormGroup.controls.login.value,
      password: this.loginFormGroup.controls.password.value
    };

    this.auth.emailAndPasswordLogin(credentials)
      .then(() => {
        this.dialogRef.close();
        setTimeout(() => this.router.navigateByUrl('/profile'), 0);
      }).catch((err) => this.errorMessage = Messages[err.code] || Messages.DEFAULT_MESSAGE);
  }

  loginGoogle() {
    this.auth.googleAuth()
      .then(() => {
        this.dialogRef.close();
        setTimeout(() => {
          this.router.navigateByUrl('/profile');
          //@ts-ignore
          ym(65053642,'reachGoal','completeSignUp');
        }, 0);
      })
      .catch((err) => this.errorMessage = Messages[err.code] || Messages.DEFAULT_MESSAGE);
  }

  signUp() {
    this.dialogRef.close();
    this.dialog.open(SignUpComponent, MatDialogConfig.narrowDialogWindow);
  }

  forgotPassword() {
    this.dialogRef.close();
    this.dialog.open(ResetPasswordComponent, MatDialogConfig.narrowDialogWindow);
  }

}
