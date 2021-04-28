import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomImageCropperComponent} from "./custom-image-cropper.component";
import {ImageCropperModule} from "ngx-image-cropper";


@NgModule({
  declarations: [
    CustomImageCropperComponent
  ],
  imports: [
    CommonModule,
    ImageCropperModule
  ]
})
export class CustomImageCropperModule {
  static components = {
    lazy: CustomImageCropperComponent
  };
}
