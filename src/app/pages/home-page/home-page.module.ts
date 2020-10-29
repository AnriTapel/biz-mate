import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomePageComponent} from "./home-page.component";
import {HomePageRoutingModule} from "./home-page-routing.module";
import {OfferCardModule} from "../../modules/offer-card.module";


@NgModule({
  declarations: [HomePageComponent],
  imports: [
    CommonModule,
    OfferCardModule,
    HomePageRoutingModule
  ]
})
export class HomePageModule { }
