import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {OfferFormComponent} from "../../../pages/offer-form/offer-form.component";
import {MatDialogConfig} from "../../../dialogs/MatDialogConfig";
import {DialogModuleNames} from "../../../dialogs/DialogModuleNames";
import {EventObserver} from "../../event-observer/event-observer.service";
import {OpenDialogEvent} from "../../../events/OpenDialogEvent";

@Injectable({
  providedIn: 'root'
})
export class OfferFormGuardService implements CanDeactivate<OfferFormComponent> {

  constructor(private router: Router, private eventObserver: EventObserver) {
  }

  canDeactivate(component: OfferFormComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (component.areChangesSaved) {
      return true;
    }

    const beforeClosedFunc = (res) => {
      if (res) {
        component.areChangesSaved = true;
        this.router.navigate([nextState.url]);
      }
    };
    this.eventObserver.dispatchEvent(new OpenDialogEvent(DialogModuleNames.OFFER_FORM_GUARD_MODULE_NAME, MatDialogConfig.narrowDialogWindow, beforeClosedFunc.bind(this)));
    return false;
  }
}
