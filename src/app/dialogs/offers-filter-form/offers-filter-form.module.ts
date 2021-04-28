import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OffersFilterFormComponent} from "./offers-filter-form.component";
import {ReactiveFormsModule} from "@angular/forms";
import {MaterialModule} from "../../modules/material.module";


@NgModule({
  declarations: [
    OffersFilterFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class OffersFilterFormModule {
  static components = {
    lazy: OffersFilterFormComponent
  };
}
