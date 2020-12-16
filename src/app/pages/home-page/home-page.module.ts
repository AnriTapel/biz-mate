import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomePageComponent} from "./home-page.component";
import {HomePageRoutingModule} from "./home-page-routing.module";
import {OfferCardModule} from "../../modules/offer-card.module";
import {OfferCardSkeletonModule} from "../../modules/offer-card-skeleton.module";


@NgModule({
  declarations: [HomePageComponent],
  imports: [
    CommonModule,
    OfferCardModule,
    HomePageRoutingModule,
    OfferCardSkeletonModule
  ]
})
export class HomePageModule { }
