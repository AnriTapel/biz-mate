import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OfferFormGuardComponent} from "./offer-form-guard.component";


@NgModule({
  declarations: [
    OfferFormGuardComponent
  ],
  imports: [
    CommonModule
  ]
})
export class OfferFormGuardModule {
  static components = {
    lazy: OfferFormGuardComponent
  };
}
