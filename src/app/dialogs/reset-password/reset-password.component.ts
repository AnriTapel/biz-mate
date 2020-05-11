import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../services/auth/auth.service";
import {Errors} from "../../models/Errors";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  emailControl: FormControl;
  emailSent: boolean = false;
  errorMessage: string = null;

  constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<ResetPasswordComponent>, private authService: AuthService) { }

  ngOnInit(): void {
    this.emailControl = new FormControl(null, [Validators.required, Validators.email]);
    this.emailControl.valueChanges.subscribe(() => this.errorMessage = null);
  }

  async sendEmailAndResetPassword(): Promise<void> {
    if (this.emailControl.status === 'INVALID')
      return;
    let email = this.emailControl.value;

    this.authService.resetPasswordByEmail(email)
      .then(() => this.emailSent = true)
      .catch((err) => this.errorMessage = Errors[err.code] || Errors.DEFAULT_MESSAGE);
  }

}
