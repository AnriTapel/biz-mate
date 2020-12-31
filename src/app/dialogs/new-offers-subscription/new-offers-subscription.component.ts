import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserSubscriptions} from "../../models/UserSubscriptions";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppService} from "../../services/app/app.service";
import {Observable} from "rxjs";
import {BusinessArea} from "../../models/BusinessArea";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-new-offers-subscription',
  templateUrl: './new-offers-subscription.component.html',
  styleUrls: ['./new-offers-subscription.component.scss']
})
export class NewOffersSubscriptionComponent {

  public filteredFirstBusinessArea$: Observable<BusinessArea[]>;
  public filteredSecondBusinessArea$: Observable<BusinessArea[]>;
  public filteredThirdBusinessArea$: Observable<BusinessArea[]>;

  public newOffersSubscriptionForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstArea: new FormControl(null, [Validators.required, AppService.businessAreaFieldValidator()]),
    secondArea: new FormControl(null, [AppService.businessAreaFieldValidator()]),
    thirdArea: new FormControl(null, [AppService.businessAreaFieldValidator()]),
  });

  constructor(private matDialogRef: MatDialogRef<NewOffersSubscriptionComponent>, @Inject(MAT_DIALOG_DATA) private data: any) {
    if (data && data.email) {
      this.newOffersSubscriptionForm.controls['email'].setValue(data.email);
    }

    this.filteredFirstBusinessArea$ = this.newOffersSubscriptionForm.controls.firstArea.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterBusinessAreas(value))
      );

    this.filteredSecondBusinessArea$ = this.newOffersSubscriptionForm.controls.secondArea.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterBusinessAreas(value))
      );

    this.filteredThirdBusinessArea$ = this.newOffersSubscriptionForm.controls.thirdArea.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterBusinessAreas(value))
      );
  }

  public closeDialog(): void {
    this.matDialogRef.close(false);
  }

  public subscribeNewOffers(): void {
    if (!this.newOffersSubscriptionForm.valid) {
      return;
    }
    let data = this.newOffersSubscriptionForm.getRawValue();
    let areas = [AppService.getBusinessAreaByFiledValue('name', data.firstArea).id];
    if (data.secondArea !== null && data.secondArea !== '') {
      areas.push(AppService.getBusinessAreaByFiledValue('name', data.secondArea).id);
    }
    if (data.thirdArea !== null && data.thirdArea !== '') {
      areas.push(AppService.getBusinessAreaByFiledValue('name', data.thirdArea).id);
    }

    let subscriptionParams: UserSubscriptions = {
      email: data.email.toLowerCase(),
      newOfferAreas: areas.includes(0) ? [0] : areas
    };
    this.matDialogRef.close(subscriptionParams);
  }
}
