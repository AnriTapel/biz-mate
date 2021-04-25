import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OfferCardComponent} from "./offer-card.component";
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [
    OfferCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ], exports: [
    OfferCardComponent
  ]
})
export class OfferCardModule { }
