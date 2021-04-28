import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss']
})
export class EmailVerifyComponent implements OnInit {

  resendEnabled: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private authService: AuthService,
              private matDialogRef: MatDialogRef<EmailVerifyComponent>) {
  }

  ngOnInit(): void {
    if (this.data.alreadySent) {
      this.startTimer();
    } else {
      this.resendEnabled = true;
    }
  }

  private startTimer(): void {
    this.resendEnabled = false;
    setTimeout(() => {
      this.resendEnabled = true;
    }, 120000);
  }

  public sendEmailVerificationEmail(): void {
    this.authService.sendEmailVerification();
    this.startTimer();
  }

  public closeDialog(): void {
    this.matDialogRef.close();
  }

}
