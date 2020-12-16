import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferCardSkeletonComponent} from "../template-blocks/offer-card-skeleton/offer-card-skeleton.component";

@NgModule({
  declarations: [
    OfferCardSkeletonComponent
  ],
  imports: [
    CommonModule
  ], exports: [
    OfferCardSkeletonComponent
  ]
})
export class OfferCardSkeletonModule { }
