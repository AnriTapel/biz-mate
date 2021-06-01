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
import {AuthService} from "./services/auth/auth.service";
import {AppService} from "./services/app/app.service";
import {AngularFireAnalyticsModule} from "@angular/fire/analytics";
import AppEventNames from "./events/AppEventNames";
import {MaterialModule} from "./modules/material.module";
import {AngularFireFunctionsModule} from "@angular/fire/functions";
import {ErrorsService} from "./services/errors/errors.service";
import {AngularFireStorageModule} from "@angular/fire/storage";


/***
 *
 * Resolving init only after getting both succeed events from Auth and App
 *
 */
export function appInitFactory(auth: AuthService, appService: AppService) {
  return (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      auth.appInitAuth()
        .then(() => {
            document.addEventListener(AppEventNames.INIT_APP_DATA_SUCCESS, resolve);
            try {
              appService.appInit();
            } catch (e) {
              ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'appInitFactory.app', error: e});
              showGlobalError(reject);
              return;
            }
          }
        ).catch((e) => {
          ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'appInitFactory.auth', error: e});
          showGlobalError(reject);
          return;
      });
    });
  };

  function showGlobalError(reject: Function){
    document.getElementById('initial_spinner').style.display = 'none';
    document.getElementById('init_error_message').removeAttribute('style');
    reject();
  }
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
  ], providers: [
    {provide: APP_INITIALIZER, useFactory: appInitFactory, deps: [AuthService, AppService, ErrorsService], multi: true}
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
