import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {AppService} from "./app/services/app/app.service";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((e) => {
    console.error(e);
    AppService.hideInitialSpinner();
    AppService.showGlobalError();
  });
