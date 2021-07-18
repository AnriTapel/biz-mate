import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {AppService} from "./app/services/app/app.service";

enableProdMode();

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(() => {
      AppService.hideInitialSpinner();
      AppService.showGlobalError();
    });
});
