import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from "@angular/forms";
import {environment} from "../environments/environment";
import {HeaderComponent} from "./template-blocks/header/header.component";
import {FooterComponent} from "./template-blocks/footer/footer.component";
import {NotificationBarComponent} from "./template-blocks/notification-bar/notification-bar.component";
import {OverlayComponent} from "./template-blocks/overlay/overlay.component";
import {MaterialModule} from "./modules/material.module";
import {FunctionsService} from "./services/functions/functions.service";
import {AuthService} from "./services/auth/auth.service";
import {AppService} from "./services/app/app.service";
import AppEventNames from "./events/AppEventNames";
import {NgxImageCompressService} from "ngx-image-compress";
import {AuthGuardService} from "./services/guards/auth-guard/auth-guard.service";
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {enableIndexedDbPersistence, getFirestore, provideFirestore} from '@angular/fire/firestore';
import {getStorage, provideStorage} from "@angular/fire/storage";
import {getAnalytics, provideAnalytics} from "@angular/fire/analytics";
import {getAuth, provideAuth} from "@angular/fire/auth";
import {getFunctions, provideFunctions} from "@angular/fire/functions";
import {EventObserver} from "./services/event-observer/event-observer.service";
import {InitAuthEvent} from "./events/InitAuthEvent";
import {InitDataEvent} from "./events/InitDataEvent";


function initializeAppFactory(appService: AppService, authService: AuthService, eventObserver: EventObserver): () => Promise<void> {
  return (): Promise<void> => {
    return new Promise((resolve, reject) => {
      let status = {app: false, auth: false};
      let initAuthSubscription, initDataSubscription;
      initAuthSubscription = eventObserver.getEventObservable(AppEventNames.INIT_APP_AUTH).subscribe((event: InitAuthEvent) => {
        if (!event.isSuccess) {
          reject();
          return;
        }

        AppService.unsubscribeHandler([initAuthSubscription]);
        eventObserver.detachEventObservable(AppEventNames.INIT_APP_AUTH);
        status.auth = true;
        if (status.app) {
          resolve();
        }
      });

      initDataSubscription = eventObserver.getEventObservable(AppEventNames.INIT_APP_DATA).subscribe((event: InitDataEvent) => {
        if (!event.isSuccess) {
          reject();
          return;
        }

        AppService.unsubscribeHandler([initDataSubscription]);
        eventObserver.detachEventObservable(AppEventNames.INIT_APP_DATA);
        status.app = true;
        if (status.auth) {
          resolve();
        }
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
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => {
      const firestore = getFirestore();
      enableIndexedDbPersistence(firestore);
      return firestore;
    }),
    provideStorage(() => getStorage()),
    provideFunctions(() => getFunctions()),
    provideAnalytics(() => getAnalytics()),
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    AuthGuardService,
    NgxImageCompressService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AppService, AuthService, EventObserver, FunctionsService],
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
