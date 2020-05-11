import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {EmailVerifyComponent} from "../email-verify-message/email-verify.component";
import {DialogConfigType, MatDialogConfig} from "../mat-dialog-config";
import {Errors} from "../../models/Errors";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signUpFormGroup: FormGroup;
  hidePassword: boolean = true;
  errorMessage: string = null;

  constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<SignUpComponent>, private auth: AuthService) {
    this.signUpFormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });

    this.signUpFormGroup.valueChanges.subscribe(() => this.errorMessage = null);
  }

  ngOnInit(): void {
  }

  signUp() {
    if(this.signUpFormGroup.status === 'INVALID')
      return;

    const credentials = {
      email: this.signUpFormGroup.controls.email.value,
      password: this.signUpFormGroup.controls.password.value,
      name: this.signUpFormGroup.controls.name.value,
    };

    this.auth.emailPasswordSignUp(credentials).then(() => {
      this.dialogRef.close();
      this.dialog.open(EmailVerifyComponent,
        MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, credentials.email));
    }).catch((err) => {
      this.errorMessage = Errors[err.code] || Errors.DEFAULT_MESSAGE;
    });
  }

}
