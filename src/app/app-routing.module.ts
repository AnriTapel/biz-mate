import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomePageComponent} from "./pages/home-page/home-page.component";
import {OfferFormComponent} from "./pages/offer-form/offer-form.component";
import {OfferPageComponent} from "./pages/offer-page/offer-page.component";
import {ProfilePageComponent} from "./pages/profile-page/profile-page.component";
import {AuthGuardService} from "./services/auth-guard/auth-guard.service";



const routes: Routes = [
  {path: '', component: HomePageComponent, pathMatch: "full"},
  {path: 'new-offer', component: OfferFormComponent, pathMatch: "full", canActivate: [AuthGuardService]},
  {path: 'edit-offer/:offerId', component: OfferFormComponent, canActivate: [AuthGuardService]},
  {path: 'profile', component: ProfilePageComponent, pathMatch: "full", canActivate: [AuthGuardService]},
  {path: 'offer/:id', component: OfferPageComponent},
  {path: '**', component: HomePageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
