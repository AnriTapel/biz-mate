import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfilePageRoutingModule} from './profile-page-routing.module';
import {ProfilePageComponent} from "./profile-page.component";
import {CustomImageCropperComponent} from "../../template-blocks/image-cropper/custom-image-cropper.component";
import {ImageCropperModule} from "ngx-image-cropper";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {OfferCardModule} from "../../template-blocks/offer-card/offer-card.module";
import {OfferCardSkeletonModule} from "../../template-blocks/offer-card-skeleton/offer-card-skeleton.module";


@NgModule({
  declarations: [
    ProfilePageComponent,
    CustomImageCropperComponent
  ],
  imports: [
    CommonModule,
    ProfilePageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    OfferCardModule,
    ImageCropperModule,
    OfferCardSkeletonModule
  ]
})
export class ProfilePageModule { }
