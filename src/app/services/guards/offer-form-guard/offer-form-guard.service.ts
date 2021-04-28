import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {OfferFormComponent} from "../../../pages/offer-form/offer-form.component";
import {MatDialogConfig} from "../../../dialogs/mat-dialog-config";
import {MatDialog} from "@angular/material/dialog";
import {AppService} from "../../app/app.service";
import {LazyLoadingService} from "../../lazy-loading/lazy-loading.service";

@Injectable({
  providedIn: 'root'
})
export class OfferFormGuardService implements CanDeactivate<OfferFormComponent> {

  private dialogHandler: any = undefined;

  constructor(private router: Router, private dialog: MatDialog, private lazyLoadingService: LazyLoadingService) {
  }

  canDeactivate(component: OfferFormComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (component.areChangesSaved) {
      return true;
    }

    this.lazyLoadingService.getLazyLoadedComponent(LazyLoadingService.OFFER_FORM_GUARD_MODULE_NAME)
      .then(comp => {
        let offerGuardDialogRef = this.dialog.open(comp, MatDialogConfig.narrowDialogWindow);
        this.dialogHandler = offerGuardDialogRef.afterClosed().subscribe((res) => {
          AppService.unsubscribeHandler([this.dialogHandler]);
          if (res) {
            component.areChangesSaved = true;
            this.router.navigate([nextState.url]);
          }
        });
      }).catch(console.error);
    return false;
  }
}
