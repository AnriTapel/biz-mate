import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeleteOfferComponent} from "./delete-offer.component";


@NgModule({
  declarations: [
    DeleteOfferComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DeleteOfferModule {
  static components = {
    lazy: DeleteOfferComponent
  };
}
