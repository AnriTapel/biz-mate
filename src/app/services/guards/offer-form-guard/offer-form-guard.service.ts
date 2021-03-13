import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {OfferFormComponent} from "../../../pages/offer-form/offer-form.component";
import {MatDialogConfig} from "../../../dialogs/mat-dialog-config";
import {MatDialog} from "@angular/material/dialog";
import {OfferFormGuardComponent} from "../../../dialogs/offer-form-guard/offer-form-guard.component";

@Injectable({
  providedIn: 'root'
})
export class OfferFormGuardService implements CanDeactivate<OfferFormComponent>{

  constructor(private router: Router, private dialog: MatDialog) { }

  canDeactivate(component: OfferFormComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (component.areChangesSaved) {
      return true;
    }

    let offerGuardDialogRef = this.dialog.open(OfferFormGuardComponent, MatDialogConfig.narrowDialogWindow);
    offerGuardDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        component.areChangesSaved = true;
        this.router.navigate([nextState.url]);
      }
    });
    return false;
  }
}
