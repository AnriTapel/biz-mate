import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {NewOffersSubscriptionComponent} from "./new-offers-subscription.component";


@NgModule({
  declarations: [
    NewOffersSubscriptionComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class NewOffersSubscriptionModule {
  static components = {
    lazy: NewOffersSubscriptionComponent
  };
}
