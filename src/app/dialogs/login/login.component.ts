import {Component, Inject} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DialogConfigType, MatDialogConfig} from "../MatDialogConfig";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Messages} from "../../models/Messages";
import {Router} from "@angular/router";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";
import {EventObserver} from "../../services/event-observer/event-observer.service";
import {DialogModuleNames} from "../DialogModuleNames";
import {OpenDialogEvent} from "../../events/OpenDialogEvent";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public loginFormGroup: FormGroup;
  public signUpFormGroup: FormGroup;
  public userHasAccount: boolean = true;
  public hidePassword: boolean = true;
  public acceptRules: boolean = true;
  public errorMessage: string = null;

  constructor(private auth: AuthService, private dialogRef: MatDialogRef<LoginComponent>, private eventObserver: EventObserver,
              private router: Router, @Inject(MAT_DIALOG_DATA) private data: any) {
    this.loginFormGroup = new FormGroup({
      login: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });

    this.signUpFormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });

    this.loginFormGroup.valueChanges.subscribe(() => this.errorMessage = null);
    this.signUpFormGroup.valueChanges.subscribe(() => this.errorMessage = null);
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
        this.eventObserver.dispatchEvent(new GoogleAnalyticsEvent('complete_sign_up'));
        this.onSuccessfulLogin();
      }).catch((err) => this.errorMessage = Messages[err.code] || Messages.DEFAULT_MESSAGE);
  }

  private onSuccessfulLogin(): void {
    this.dialogRef.close();
    if (!this.userHasAccount) {
      return;
    }
    if (this.data && this.data.redirectUrl) {
      setTimeout(() => this.router.navigateByUrl(this.data.redirectUrl), 0);
    }
  }

  public signUp() {
    if (!this.signUpFormGroup.valid) {
      return;
    }

    const credentials = {
      email: this.signUpFormGroup.controls.email.value,
      password: this.signUpFormGroup.controls.password.value,
      name: this.signUpFormGroup.controls.name.value,
    };

    this.auth.emailPasswordSignUp(credentials).then(() => {
      this.onSuccessfulLogin();
      this.eventObserver.dispatchEvent(new OpenDialogEvent(DialogModuleNames.EMAIL_VERIFY_MESSAGE_MODULE_NAME,
        MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {
          email: credentials.email,
          alreadySent: true
        })));
    }).catch((err) => {
      this.errorMessage = Messages[err.code] || Messages.DEFAULT_MESSAGE;
    });
  }

  public forgotPassword() {
    this.dialogRef.close();
    this.eventObserver.dispatchEvent(new OpenDialogEvent(DialogModuleNames.RESET_PASSWORD_MODULE_NAME, MatDialogConfig.narrowDialogWindow))
  }

}
