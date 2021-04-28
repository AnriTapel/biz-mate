import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmailVerifyComponent} from "./email-verify.component";


@NgModule({
  declarations: [
    EmailVerifyComponent
  ],
  imports: [
    CommonModule
  ]
})
export class EmailVerifyModule {
  static components = {
    lazy: EmailVerifyComponent
  };
}
