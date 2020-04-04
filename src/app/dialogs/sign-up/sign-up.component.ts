import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signUpFormGroup: FormGroup;
  hidePassword: boolean = true;

  constructor(private dialog: MatDialog, private dialogRef: MatDialogRef<SignUpComponent>, private auth: AuthService) {
    this.signUpFormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  signUp() {
    const credentials = {
      email: this.signUpFormGroup.controls.email.value,
      password: this.signUpFormGroup.controls.password.value,
      name: this.signUpFormGroup.controls.name.value,
    };

    this.auth.emailPasswordSignUp(credentials).then(() => {
      console.log("New user signed up");
    }).catch((err) => {
      console.error("Error occurred while singing up new user");
      console.log(err);
    }).finally(() => {
      this.dialogRef.close();
    });
  }

}
