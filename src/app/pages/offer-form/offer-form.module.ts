import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferFormRoutingModule} from './offer-form-routing.module';
import {OfferFormComponent} from "./offer-form.component";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {PhoneMaskModule} from "../../modules/phone-mask.module";


@NgModule({
  declarations: [
    OfferFormComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    PhoneMaskModule,
    OfferFormRoutingModule
  ]
})
export class OfferFormModule { }
