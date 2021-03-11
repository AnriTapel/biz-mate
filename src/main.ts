import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error(err);

    const errorMsgElement = document.getElementById('init_error_message');
    errorMsgElement.removeAttribute('style');

    const initialSpinnerElement = document.getElementById('initial_spinner');
    initialSpinnerElement.style.display = 'none';
  });
