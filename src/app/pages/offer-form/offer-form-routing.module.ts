import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {OfferFormComponent} from "./offer-form.component";
import {MaterialModule} from "../../modules/material.module";

const routes: Routes = [{ path: '', component: OfferFormComponent }];

@NgModule({
  imports: [
    MaterialModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class OfferFormRoutingModule { }
