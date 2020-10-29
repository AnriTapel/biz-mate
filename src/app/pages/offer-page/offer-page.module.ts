import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferPageRoutingModule} from './offer-page-routing.module';
import {OfferPageComponent} from "./offer-page.component";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [OfferPageComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    OfferPageRoutingModule
  ]
})
export class OfferPageModule { }
