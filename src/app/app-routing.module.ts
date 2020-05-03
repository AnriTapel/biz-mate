import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomePageComponent} from "./pages/home-page/home-page.component";
import {OfferFormComponent} from "./pages/offer-form/offer-form.component";
import {OfferPageComponent} from "./pages/offer-page/offer-page.component";
import {ProfilePageComponent} from "./pages/profile-page/profile-page.component";



const routes: Routes = [
  {path: '', component: HomePageComponent, pathMatch: "full"},
  {path: 'new-offer', component: OfferFormComponent, pathMatch: "full"},
  {path: 'edit-offer/:offerId', component: OfferFormComponent},
  {path: 'profile', component: ProfilePageComponent, pathMatch: "full"},
  {path: 'offer/:id', component: OfferPageComponent},
  {path: '**', component: HomePageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
