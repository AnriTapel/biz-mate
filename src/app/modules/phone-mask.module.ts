import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PhoneMaskDirective} from "../directives/phone-mask/phone-mask.directive";



@NgModule({
  declarations: [
    PhoneMaskDirective
  ],
  imports: [
    CommonModule
  ], exports: [
    PhoneMaskDirective
  ]
})
export class PhoneMaskModule { }
