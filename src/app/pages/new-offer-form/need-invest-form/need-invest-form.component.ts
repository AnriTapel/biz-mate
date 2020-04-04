import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {BusinessArea} from "../../../models/BusinessArea";
import {City} from "../../../models/City";
import {map, startWith} from "rxjs/operators";
import {FilterFunctions} from "../../../filter-functions";
import {NewOfferAbsClass} from "../new-offer-abs-class";
import {NewOffer} from "../../../models/NewOffer";
import {OfferTypes} from "../../../models/OfferTypes";
import {AuthService} from "../../../services/auth/auth.service";
import * as firebase from "firebase";
import {AngularFirestore} from "@angular/fire/firestore";

@Component({
  selector: 'app-need-invest-form',
  templateUrl: './need-invest-form.component.html',
  styleUrls: ['./need-invest-form.component.scss']
})
export class NeedInvestFormComponent extends NewOfferAbsClass implements OnInit {

  readonly OFFER_TYPE: OfferTypes = OfferTypes.NEED_INVESTMENTS;
  fieldsLabels: any = null;

  needInvestmentsForm: FormGroup;

  filteredBusinessAreas$: Observable<BusinessArea[]>;
  filteredCities$: Observable<City[]>;

  constructor(private af: AngularFirestore, private authService: AuthService){
    super(af, authService);
  }

  ngOnInit(): void {
    const userData = this.getUserAccountData();
    this.needInvestmentsForm = new FormGroup({
      name: new FormControl(userData ? userData.name : '', [Validators.required]),
      city: new FormControl('', [Validators.required, this.cityFiledValidator()]),
      businessAreas: new FormControl('', [Validators.required, this.businessAreaFieldValidator()]),
      title: new FormControl('', [Validators.required]),
      capital: new FormControl(null, [Validators.required]),
      desc: new FormControl('', [Validators.required]),
      experience: new FormControl(''),
      conditions: new FormControl(''),
      phone: new FormControl('', [Validators.required]),
      email: new FormControl(userData ? userData.email : '', [Validators.email])
    });

    this.filteredCities$ = this.needInvestmentsForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCities(value))
      );

    this.filteredBusinessAreas$ = this.needInvestmentsForm.controls.businessAreas.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCategories(value))
      );

    this.fieldsLabels = this.getFieldsLabels(this.OFFER_TYPE);
  }

  checkAndPostOffer(): void {
    if (!this.needInvestmentsForm.valid)
      return;

    const offerData: NewOffer = {
      type: this.OFFER_TYPE,
      name: this.needInvestmentsForm.controls.name.value,
      title: this.needInvestmentsForm.controls.title.value,
      city: this.needInvestmentsForm.controls.city.value,
      business_areas: [this.needInvestmentsForm.controls.businessAreas.value],
      desc: this.needInvestmentsForm.controls.desc.value,
      capital: this.needInvestmentsForm.controls.capital.value,
      conditions: this.needInvestmentsForm.controls.conditions.value,
      experience: this.needInvestmentsForm.controls.experience.value,
      date: new Date(),
      phone: this.needInvestmentsForm.controls.phone.value,
      email: this.needInvestmentsForm.controls.email.value
    };

    this.sendOffer(offerData).then((ok) => {
      console.log(ok);
    }).catch((err) => {
      console.log(err);
    });
  }

}
