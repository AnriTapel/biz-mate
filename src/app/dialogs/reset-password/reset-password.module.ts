import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResetPasswordComponent} from "./reset-password.component";
import {ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "../../modules/material.module";


@NgModule({
  declarations: [
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class ResetPasswordModule {
  static components = {
    lazy: ResetPasswordComponent
  };
}
