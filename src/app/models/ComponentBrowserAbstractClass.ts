import {OnDestroy, OnInit} from "@angular/core";
import {AppService} from "../services/app/app.service";

export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected constructor() {
    console.log('Route change');
    //@ts-ignore
    ym(65053642, 'hit', location.href);
  }

  ngOnDestroy(): void {
    document.querySelector('#header').scrollIntoView({
      behavior: "smooth"
    });
  }

}
