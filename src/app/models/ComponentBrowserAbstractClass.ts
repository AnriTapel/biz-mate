import {OnDestroy} from "@angular/core";

export abstract class ComponentBrowserAbstractClass implements OnDestroy {

  protected constructor() {
    //@ts-ignore
    ym(65053642, 'hit', location.href);
  }

  ngOnDestroy(): void {
    document.querySelector('#header').scrollIntoView({
      behavior: "smooth"
    });
  }

}
