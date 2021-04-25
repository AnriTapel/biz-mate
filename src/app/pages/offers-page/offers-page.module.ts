import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OffersPageRoutingModule} from './offers-page-routing.module';
import {OffersPageComponent} from "./offers-page.component";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {OfferCardModule} from "../../template-blocks/offer-card/offer-card.module";


@NgModule({
  declarations: [OffersPageComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    OfferCardModule,
    OffersPageRoutingModule
  ]
})
export class OffersPageModule { }
