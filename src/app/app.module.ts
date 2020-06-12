import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomePageComponent } from './pages/home-page/home-page.component';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { OfferFormComponent } from './pages/offer-form/offer-form.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import {environment} from "../environments/environment";
import { HeaderComponent } from './template-blocks/header/header.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import { SignUpComponent } from './dialogs/sign-up/sign-up.component';
import { LoginComponent } from './dialogs/login/login.component';
import {MatIconModule} from "@angular/material/icon";
import {AuthService} from "./services/auth/auth.service";
import { OfferPageComponent } from './pages/offer-page/offer-page.component';
import { FooterComponent } from './template-blocks/footer/footer.component';
import { OfferCardComponent } from './template-blocks/offer-card/offer-card.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { ResetPasswordComponent } from './dialogs/reset-password/reset-password.component';
import { EmailVerifyComponent } from './dialogs/email-verify-message/email-verify.component';
import { CustomImageCropperComponent } from './template-blocks/image-cropper/custom-image-cropper.component';
import {ImageCropperModule} from "ngx-image-cropper";
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { NotificationComponent } from './dialogs/notification/notification.component';
import { NotificationBarComponent } from './template-blocks/notification-bar/notification-bar.component';
import { OffersPageComponent } from './pages/offers-page/offers-page.component';
import { PhoneMaskDirective } from './directives/phone-mask/phone-mask.directive';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { RulesComponent } from './pages/rules/rules.component';
import { DeleteOfferComponent } from './dialogs/delete-offer/delete-offer.component';

export function appInitFactory(auth: AuthService) {
  return (): Promise<any> => {
    return auth.appInitAuth();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    OfferFormComponent,
    HeaderComponent,
    SignUpComponent,
    LoginComponent,
    OfferPageComponent,
    FooterComponent,
    OfferCardComponent,
    ProfilePageComponent,
    ResetPasswordComponent,
    EmailVerifyComponent,
    CustomImageCropperComponent,
    NotFoundComponent,
    NotificationComponent,
    NotificationBarComponent,
    OffersPageComponent,
    PhoneMaskDirective,
    FeedbackComponent,
    RulesComponent,
    DeleteOfferComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    ImageCropperModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatIconModule,
    MatCheckboxModule

  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: appInitFactory, deps: [AuthService], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
