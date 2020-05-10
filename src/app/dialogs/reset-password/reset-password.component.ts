import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  emailControl: FormControl;

  constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<ResetPasswordComponent>, private authService: AuthService) { }

  ngOnInit(): void {
    this.emailControl = new FormControl(null, [Validators.required, Validators.email]);
  }

  async sendEmailAndResetPassword(): Promise<void> {
    let email = this.emailControl.value;
    if (!email || email === '' || !this.emailControl.valid)
      return;

    let res = await this.authService.resetPasswordByEmail(email);
    console.log(res);
    this.dialogRef.close();
  }

}
