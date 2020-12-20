import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ShareButtonsComponent} from "../template-blocks/share-buttons/share-buttons.component";



@NgModule({
  declarations: [
    ShareButtonsComponent
  ],
  imports: [
    CommonModule
  ], exports: [
    ShareButtonsComponent
  ]
})
export class ShareButtonsModule { }
