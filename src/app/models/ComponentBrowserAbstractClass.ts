import {OnDestroy} from "@angular/core";
import {AppService} from "../services/app/app.service";

export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected constructor() {
  }

  ngOnDestroy(): void {
    if (AppService.isPlatformBrowser()) {
      document.querySelector('#header').scrollIntoView({
        behavior: "smooth"
      });
    }
  }

}
