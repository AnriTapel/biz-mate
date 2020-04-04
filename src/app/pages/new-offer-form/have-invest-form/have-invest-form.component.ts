import { Component, OnInit } from '@angular/core';
import {NewOfferAbsClass} from "../new-offer-abs-class";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {BusinessArea} from "../../../models/BusinessArea";
import {City} from "../../../models/City";
import {map, startWith} from "rxjs/operators";
import {FilterFunctions} from "../../../filter-functions";
import {NewOffer} from "../../../models/NewOffer";
import {OfferTypes} from "../../../models/OfferTypes";
import {AuthService} from "../../../services/auth/auth.service";
import * as firebase from "firebase";
import {AngularFirestore} from "@angular/fire/firestore";

@Component({
  selector: 'app-have-invest-form',
  templateUrl: './have-invest-form.component.html',
  styleUrls: ['./have-invest-form.component.scss']
})
export class HaveInvestFormComponent extends NewOfferAbsClass implements OnInit {

  readonly OFFER_TYPE: OfferTypes = OfferTypes.HAVE_INVESTMENTS;
  fieldsLabels: any = null;

  haveInvestmentsForm: FormGroup;

  filteredBusinessAreas$: Observable<BusinessArea[]>;
  filteredCities$: Observable<City[]>;

  constructor(private af: AngularFirestore, private authService: AuthService){
    super(af, authService);
  }

  ngOnInit(): void {
    const userData = this.getUserAccountData();
    this.haveInvestmentsForm = new FormGroup({
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

    this.filteredCities$ = this.haveInvestmentsForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCities(value))
      );

    this.filteredBusinessAreas$ = this.haveInvestmentsForm.controls.businessAreas.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCategories(value))
      );

    this.fieldsLabels = this.getFieldsLabels(this.OFFER_TYPE);
  }

  checkAndPostOffer(): void {
    if (!this.haveInvestmentsForm.valid)
      return;

    const offerData: NewOffer = {
      type: this.OFFER_TYPE,
      name: this.haveInvestmentsForm.controls.name.value,
      title: this.haveInvestmentsForm.controls.title.value,
      city: this.haveInvestmentsForm.controls.city.value,
      business_areas: [this.haveInvestmentsForm.controls.businessAreas.value],
      desc: this.haveInvestmentsForm.controls.desc.value,
      capital: this.haveInvestmentsForm.controls.capital.value,
      conditions: this.haveInvestmentsForm.controls.conditions.value,
      experience: this.haveInvestmentsForm.controls.experience.value,
      date: new Date(),
      phone: this.haveInvestmentsForm.controls.phone.value,
      email: this.haveInvestmentsForm.controls.email.value
    };

    this.sendOffer(offerData).then((ok) => {
      console.log(ok);
    }).catch((err) => {
      console.log(err);
    });
  }

}
