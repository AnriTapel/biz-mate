import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {AppService} from "../../services/app/app.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FilterFieldName} from "../../models/FilterFields";
import {OfferType} from "../../models/IOfferType";

@Component({
  selector: 'app-offers-filter-form',
  templateUrl: './offers-filter-form.component.html',
  styleUrls: ['./offers-filter-form.component.scss']
})
export class OffersFilterFormComponent implements OnInit {

  public searchForm: FormGroup;
  public filteredOfferTypes$: Observable<OfferType[]>;
  public filteredBusinessArea$: Observable<BusinessArea[]>;
  public filteredCities$: Observable<City[]>;
  public isTouchDevice: boolean = AppService.isTouchableDevice();

  constructor(private appService: AppService, private dialogRef: MatDialogRef<OffersFilterFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      [FilterFieldName.OFFER_TYPE]: new FormControl(null, [this.appService.offerTypeValidator()]),
      [FilterFieldName.BUSINESS_AREA]: new FormControl(null, [this.appService.businessAreaFieldValidator()]),
      [FilterFieldName.CITY]: new FormControl(null, [this.appService.cityFieldValidator()])
    });

    this.filteredOfferTypes$ = this.searchForm.controls.type.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterOfferTypes(value))
      );

    this.filteredCities$ = this.searchForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterCities(value))
      );

    this.filteredBusinessArea$ = this.searchForm.controls.businessArea.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterBusinessAreas(value))
      );

    this.resolveInputData();
  }

  private resolveInputData(): void {
    for (let field in this.data) {
      this.searchForm.controls[field].setValue(this.data[field]);
    }
  }

  public getOfferTypes(): any[] {
    return this.appService.offerTypes;
  }

  public getBusinessAreas(): BusinessArea[] {
    return this.appService.businessAreas;
  }

  public clearFilterForm(): void {
    this.searchForm.reset();
  }

  public applyFilter(): void {
    if (!this.searchForm.valid) {
      return;
    }
    this.dialogRef.close(this.searchForm.getRawValue());
  }
}
