import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomePageComponent} from "./pages/home-page/home-page.component";
import {NewOfferFormComponent} from "./pages/new-offer-form/new-offer-form.component";
import {OfferPageComponent} from "./pages/offer-page/offer-page.component";



const routes: Routes = [
  {path: '', component: HomePageComponent, pathMatch: "full"},
  {path: 'new-offer', component: NewOfferFormComponent, pathMatch: "full"},
  {path: 'offer/:id', component: OfferPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
