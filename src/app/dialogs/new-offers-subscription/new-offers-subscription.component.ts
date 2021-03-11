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
  public isTouchableDevice: boolean;

  public newOffersSubscriptionForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    firstArea: new FormControl(this.appService.getBusinessAreaByFiledValue('id', 0).name,
      [Validators.required, this.appService.businessAreaFieldValidator()]),
    secondArea: new FormControl(null, [this.appService.businessAreaFieldValidator()]),
    thirdArea: new FormControl(null, [this.appService.businessAreaFieldValidator()]),
  });

  constructor(private matDialogRef: MatDialogRef<NewOffersSubscriptionComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
      private appService: AppService) {
    this.isTouchableDevice = AppService.isTouchableDevice();
    if (data && data.email) {
      this.newOffersSubscriptionForm.controls['email'].setValue(data.email);
    }

    this.filteredFirstBusinessArea$ = this.newOffersSubscriptionForm.controls.firstArea.valueChanges
      .pipe(
        startWith( this.newOffersSubscriptionForm.controls.firstArea.value),
        map(value => this.appService._filterBusinessAreas(value))
      );

    this.filteredSecondBusinessArea$ = this.newOffersSubscriptionForm.controls.secondArea.valueChanges
      .pipe(
        startWith(this.newOffersSubscriptionForm.controls.secondArea.value),
        map(value => this.appService._filterBusinessAreas(value))
      );

    this.filteredThirdBusinessArea$ = this.newOffersSubscriptionForm.controls.thirdArea.valueChanges
      .pipe(
        startWith(this.newOffersSubscriptionForm.controls.thirdArea.value),
        map(value => this.appService._filterBusinessAreas(value))
      );
  }

  public getBusinessAreas(): BusinessArea[] {
    return this.appService.businessAreas;
  }

  public closeDialog(): void {
    this.matDialogRef.close(false);
  }

  public subscribeNewOffers(): void {
    if (!this.newOffersSubscriptionForm.valid) {
      return;
    }
    let data = this.newOffersSubscriptionForm.getRawValue();
    let areas = [this.appService.getBusinessAreaByFiledValue('name', data.firstArea).id];
    if (data.secondArea !== null && data.secondArea !== '') {
      areas.push(this.appService.getBusinessAreaByFiledValue('name', data.secondArea).id);
    }
    if (data.thirdArea !== null && data.thirdArea !== '') {
      areas.push(this.appService.getBusinessAreaByFiledValue('name', data.thirdArea).id);
    }

    let subscriptionParams: UserSubscriptions = {
      email: data.email.toLowerCase(),
      newOfferAreas: areas.includes(0) ? [0] : areas
    };
    this.matDialogRef.close(subscriptionParams);
  }
}
