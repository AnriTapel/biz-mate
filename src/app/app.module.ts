import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {environment} from "../environments/environment";
import {HeaderComponent} from "./template-blocks/header/header.component";
import {FooterComponent} from "./template-blocks/footer/footer.component";
import {NotificationBarComponent} from "./template-blocks/notification-bar/notification-bar.component";
import {OverlayComponent} from "./template-blocks/overlay/overlay.component";
import {AngularFireAnalyticsModule} from "@angular/fire/analytics";
import {MaterialModule} from "./modules/material.module";
import {AngularFireFunctionsModule} from "@angular/fire/functions";
import {AngularFireStorageModule} from "@angular/fire/storage";
import {ErrorsService} from "./services/errors/errors.service";
import {AuthService} from "./services/auth/auth.service";
import {AppService} from "./services/app/app.service";
import AppEventNames from "./events/AppEventNames";


export function initializeAppFactory(appService: AppService, authService: AuthService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise((resolve, reject) => {
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

      document.addEventListener(AppEventNames.APP_INIT_ERROR, () => {
        reject();
      });

      authService.initAuth();
      appService.appInit();
    });
  };
}


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    NotificationBarComponent,
    OverlayComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    AngularFireAnalyticsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AppService, AuthService, ErrorsService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  /**
   * This is for firebase functions to work in emulator
   */
  /*constructor(private functions: AngularFireFunctions) {
    this.functions.useFunctionsEmulator('http://localhost:5001');
  }*/
}
