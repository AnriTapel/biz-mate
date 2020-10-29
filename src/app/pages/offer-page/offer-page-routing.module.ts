import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {OfferPageComponent} from "./offer-page.component";

const routes: Routes = [{ path: '', component: OfferPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferPageRoutingModule { }
