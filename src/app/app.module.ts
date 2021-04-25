import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {environment} from "../environments/environment";
import {DeleteOfferComponent} from './dialogs/delete-offer/delete-offer.component';
import {HeaderComponent} from "./template-blocks/header/header.component";
import {FooterComponent} from "./template-blocks/footer/footer.component";
import {LoginComponent} from "./dialogs/login/login.component";
import {ResetPasswordComponent} from "./dialogs/reset-password/reset-password.component";
import {EmailVerifyComponent} from "./dialogs/email-verify-message/email-verify.component";
import {NotificationComponent} from "./dialogs/notification/notification.component";
import {NotificationBarComponent} from "./template-blocks/notification-bar/notification-bar.component";
import {OverlayComponent} from "./template-blocks/overlay/overlay.component";
import {AuthService} from "./services/auth/auth.service";
import {NewOffersSubscriptionComponent} from './dialogs/new-offers-subscription/new-offers-subscription.component';
import {AppService} from "./services/app/app.service";
import {AngularFireAnalyticsModule} from "@angular/fire/analytics";
import {OfferFormGuardComponent} from './dialogs/offer-form-guard/offer-form-guard.component';
import {OffersFilterFormComponent} from './dialogs/offers-filter-form/offers-filter-form.component';
import AppEventNames from "./events/AppEventNames";
import {MaterialModule} from "./modules/material.module";


/***
 *
 * Resolving init only after getting both succeed events from Auth and App
 *
 */
export function appInitFactory(auth: AuthService, appService: AppService) {
  return (): Promise<any> => {
    return new Promise<any>((resolve) => {
      let status = {app: false, auth: false};
      document.addEventListener(AppEventNames.INIT_AUTH_SUCCESS, () => {
        status.auth = true;
        if (status.app) {
          resolve();
        }
      });

      document.addEventListener(AppEventNames.INIT_APP_DATA_SUCCESS, () => {
        status.app = true;
        if (status.auth) {
          resolve();
        }
      });
      auth.appInitAuth();
      appService.appInit();
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    FooterComponent,
    ResetPasswordComponent,
    EmailVerifyComponent,
    NotificationComponent,
    NotificationBarComponent,
    DeleteOfferComponent,
    OverlayComponent,
    NewOffersSubscriptionComponent,
    OfferFormGuardComponent,
    OffersFilterFormComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireAnalyticsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule
  ], providers: [
    {provide: APP_INITIALIZER, useFactory: appInitFactory, deps: [AuthService, AppService], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
