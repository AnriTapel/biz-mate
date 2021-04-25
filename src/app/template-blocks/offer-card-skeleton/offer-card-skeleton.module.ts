import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferCardSkeletonComponent} from "./offer-card-skeleton.component";

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
