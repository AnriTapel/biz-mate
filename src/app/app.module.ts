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
import {SignUpComponent} from "./dialogs/sign-up/sign-up.component";
import {FooterComponent} from "./template-blocks/footer/footer.component";
import {LoginComponent} from "./dialogs/login/login.component";
import {ResetPasswordComponent} from "./dialogs/reset-password/reset-password.component";
import {EmailVerifyComponent} from "./dialogs/email-verify-message/email-verify.component";
import {NotificationComponent} from "./dialogs/notification/notification.component";
import {NotificationBarComponent} from "./template-blocks/notification-bar/notification-bar.component";
import {OverlayComponent} from "./template-blocks/overlay/overlay.component";
import {AuthService} from "./services/auth/auth.service";
import {MaterialModule} from "./modules/material.module";
import {NewOffersSubscriptionComponent} from './dialogs/new-offers-subscription/new-offers-subscription.component';
import {AppService} from "./services/app/app.service";
import {AngularFireAnalyticsModule} from "@angular/fire/analytics";

export function appInitFactory(auth: AuthService, appService: AppService) {
  return (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      auth.appInitAuth();
      appService.appInit().then(() => resolve())
        .catch(() => reject());
    })
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SignUpComponent,
    LoginComponent,
    FooterComponent,
    ResetPasswordComponent,
    EmailVerifyComponent,
    NotificationComponent,
    NotificationBarComponent,
    DeleteOfferComponent,
    OverlayComponent,
    NewOffersSubscriptionComponent
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
