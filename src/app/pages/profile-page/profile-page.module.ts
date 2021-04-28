import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfilePageRoutingModule} from './profile-page-routing.module';
import {ProfilePageComponent} from "./profile-page.component";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {OfferCardModule} from "../../template-blocks/offer-card/offer-card.module";
import {OfferCardSkeletonModule} from "../../template-blocks/offer-card-skeleton/offer-card-skeleton.module";


@NgModule({
  declarations: [
    ProfilePageComponent
  ],
  imports: [
    CommonModule,
    ProfilePageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    OfferCardModule,
    OfferCardSkeletonModule
  ]
})
export class ProfilePageModule { }
