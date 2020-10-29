import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfilePageRoutingModule} from './profile-page-routing.module';
import {ProfilePageComponent} from "./profile-page.component";
import {CustomImageCropperComponent} from "../../template-blocks/image-cropper/custom-image-cropper.component";
import {ImageCropperModule} from "ngx-image-cropper";
import {MaterialModule} from "../../modules/material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {OfferCardModule} from "../../modules/offer-card.module";


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
    ImageCropperModule
  ]
})
export class ProfilePageModule { }
