import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {OffersPageComponent} from "./offers-page.component";

const routes: Routes = [{ path: '', component: OffersPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OffersPageRoutingModule { }
