import {Component, Inject} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
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
export class LoginComponent {

  hidePassword: boolean = true;
  loginFormGroup: FormGroup;
  errorMessage: string = null;

  constructor(private auth: AuthService, private dialog: MatDialog, private dialogRef: MatDialogRef<LoginComponent>,
              private router: Router, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.loginFormGroup = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });

    this.loginFormGroup.valueChanges.subscribe(() => this.errorMessage = null);
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
      .then(() => this.onSuccessfulLogin())
      .catch((err) => this.errorMessage = Messages[err.code] || Messages.DEFAULT_MESSAGE);
  }

  public loginGoogle() {
    this.auth.googleAuth()
      .then(() => {
        //@ts-ignore
        ym(65053642,'reachGoal','completeSignUp');
        this.onSuccessfulLogin();
      }).catch((err) => this.errorMessage = Messages[err.code] || Messages.DEFAULT_MESSAGE);
  }

  private onSuccessfulLogin(): void {
    this.dialogRef.close(true);
    if (this.data && this.data.redirectUrl && this.data.redirectUrl.length) {
      setTimeout(() => this.router.navigateByUrl(this.data.redirectUrl), 0);
    }
  }

  public signUp() {
    this.dialogRef.close(false);
    this.dialog.open(SignUpComponent, MatDialogConfig.narrowDialogWindow);
  }

  public forgotPassword() {
    this.dialogRef.close(false);
    this.dialog.open(ResetPasswordComponent, MatDialogConfig.narrowDialogWindow);
  }

}
