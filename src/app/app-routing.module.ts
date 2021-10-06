import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from "./services/guards/auth-guard/auth-guard.service";

const routes: Routes = [
  {path: '', loadChildren: () => import('./pages/home-page/home-page.module').then(m => m.HomePageModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'offers-page', loadChildren: () => import('./pages/offers-page/offers-page.module').then(m => m.OffersPageModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'new-offer', loadChildren: () => import('./pages/offer-form/offer-form.module').then(m => m.OfferFormModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'edit-offer/:offerId', loadChildren: () => import('./pages/offer-form/offer-form.module').then(m => m.OfferFormModule), canActivate: [AuthGuardService]},
  {path: 'profile', loadChildren: () => import('./pages/profile-page/profile-page.module').then(m => m.ProfilePageModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'offer/:id', loadChildren: () => import('./pages/offer-page/offer-page.module').then(m => m.OfferPageModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'feedback', loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'rules', loadChildren: () => import('./pages/rules/rules.module').then(m => m.RulesModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: 'not-found', loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundModule), pathMatch: 'full', canActivate: [AuthGuardService]},
  {path: '**', redirectTo: 'not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(){}

}
