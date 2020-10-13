import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OfferFormComponent} from "./pages/offer-form/offer-form.component";
import {OfferPageComponent} from "./pages/offer-page/offer-page.component";
import {ProfilePageComponent} from "./pages/profile-page/profile-page.component";
import {AuthGuardService} from "./services/auth-guard/auth-guard.service";
import {NotFoundComponent} from "./pages/not-found/not-found.component";
import {OffersPageComponent} from "./pages/offers-page/offers-page.component";
import {FeedbackComponent} from "./pages/feedback/feedback.component";
import {RulesComponent} from "./pages/rules/rules.component";
import {HomePageComponent} from "./pages/home-page/home-page.component";

const routes: Routes = [
  {path: '', component: HomePageComponent, pathMatch: 'full'},
  {path: 'offers-page', component: OffersPageComponent, pathMatch: 'full'},
  {path: 'new-offer', component: OfferFormComponent, pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'edit-offer/:offerId', component: OfferFormComponent, canActivate: [AuthGuardService]},
  {path: 'profile', component: ProfilePageComponent, pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'offer/:id', component: OfferPageComponent, pathMatch: 'full'},
  {path: 'feedback', component: FeedbackComponent, pathMatch: 'full'},
  {path: 'rules', component: RulesComponent, pathMatch: 'full'},
  {path: 'not-found', component: NotFoundComponent, pathMatch: 'full'},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
