import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {Messages} from "../../models/Messages";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  emailControl: FormControl;
  emailSent: boolean = false;
  errorMessage: string = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.emailControl = new FormControl(null, [Validators.required, Validators.email]);
    this.emailControl.valueChanges.subscribe(() => this.errorMessage = null);
  }

  async sendEmailAndResetPassword(): Promise<void> {
    if (!this.emailControl.valid)
      return;
    let email = this.emailControl.value;

    this.authService.resetPasswordByEmail(email)
      .then(() => this.emailSent = true)
      .catch((err) => this.errorMessage = Messages[err.code] || Messages.DEFAULT_MESSAGE);
  }

}
