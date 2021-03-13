import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {OfferFormComponent} from "./offer-form.component";
import {MaterialModule} from "../../modules/material.module";
import {OfferFormGuardService} from "../../services/guards/offer-form-guard/offer-form-guard.service";

const routes: Routes = [{ path: '', component: OfferFormComponent, canDeactivate: [OfferFormGuardService] }];

@NgModule({
  imports: [
    MaterialModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class OfferFormRoutingModule { }
