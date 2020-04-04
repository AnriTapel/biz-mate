import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SignUpComponent} from "../sign-up/sign-up.component";
import {MatDialogConfig} from "../mat-dialog-config";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hidePassword: boolean = true;
  loginFormGroup: FormGroup;

  constructor(private auth: AuthService, private dialog: MatDialog, private dialogRef: MatDialogRef<LoginComponent>) {
    this.loginFormGroup = new FormGroup({
      login: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  logIn() {
    const credentials = {
      login: this.loginFormGroup.controls.login.value,
      password: this.loginFormGroup.controls.password.value
    };

    this.auth.emailAndPasswordLogin(credentials).finally(() => {
      this.dialogRef.close();
    });
  }

  loginGoogle() {
    this.auth.googleAuth().then(() => {
      console.log("Success");
      this.dialogRef.close();
    }).catch((err) => {
      console.error("Failed");
      console.log(err);
    })
  }

  loginFacebook() {

  }

  signUp() {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(SignUpComponent, MatDialogConfig.narrowDialogWindow);

    dialogRef.afterClosed().subscribe(() => {
      console.log('SignUp dialog was closed');
    });
  }

  forgotPassword() {

  }

}
