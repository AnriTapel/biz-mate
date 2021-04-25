import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferPageRoutingModule} from './offer-page-routing.module';
import {OfferPageComponent} from "./offer-page.component";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {ShareButtonsModule} from "../../template-blocks/share-buttons/share-buttons.module";

@NgModule({
  declarations: [OfferPageComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    OfferPageRoutingModule,
    ShareButtonsModule
  ]
})
export class OfferPageModule { }
