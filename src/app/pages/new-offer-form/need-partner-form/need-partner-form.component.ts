import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {BusinessArea} from "../../../models/BusinessArea";
import {City} from "../../../models/City";
import {map, startWith} from "rxjs/operators";
import {FilterFunctions} from "../../../filter-functions";
import {NewOffer} from "../../../models/NewOffer";
import {OfferTypes} from "../../../models/OfferTypes";
import {NewOfferAbsClass} from "../new-offer-abs-class";
import {AuthService} from "../../../services/auth/auth.service";
import * as firebase from "firebase";
import {AngularFirestore} from "@angular/fire/firestore";

@Component({
  selector: 'app-need-partner-form',
  templateUrl: './need-partner-form.component.html',
  styleUrls: ['./need-partner-form.component.scss']
})
export class NeedPartnerFormComponent extends NewOfferAbsClass implements OnInit {

  readonly OFFER_TYPE: OfferTypes = OfferTypes.NEED_PARTNER;
  fieldsLabels: any = null;

  needPartnerForm: FormGroup;

  filteredBusinessAreas$: Observable<BusinessArea[]>;
  filteredCities$: Observable<City[]>;

  constructor(private af: AngularFirestore, private authService: AuthService){
    super(af, authService);
  }

  ngOnInit(): void {
    const userData = this.getUserAccountData();
    this.needPartnerForm = new FormGroup({
      name: new FormControl(userData ? userData.name : '', [Validators.required]),
      city: new FormControl('', [Validators.required, this.cityFiledValidator()]),
      businessAreas: new FormControl('', [Validators.required, this.businessAreaFieldValidator()]),
      title: new FormControl('', [Validators.required]),
      desc: new FormControl('', [Validators.required]),
      experience: new FormControl(''),
      conditions: new FormControl(''),
      phone: new FormControl('', [Validators.required]),
      email: new FormControl(userData ? userData.email : '', [Validators.email])
    });

    this.filteredCities$ = this.needPartnerForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCities(value))
      );

    this.filteredBusinessAreas$ = this.needPartnerForm.controls.businessAreas.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCategories(value))
      );

    this.fieldsLabels = this.getFieldsLabels(this.OFFER_TYPE);
  }

  checkAndPostOffer(): void {
    if (!this.needPartnerForm.valid)
      return;

    const offerData: NewOffer = {
      type: this.OFFER_TYPE,
      name: this.needPartnerForm.controls.name.value,
      title: this.needPartnerForm.controls.title.value,
      city: this.needPartnerForm.controls.city.value,
      business_areas: [this.needPartnerForm.controls.businessAreas.value],
      desc: this.needPartnerForm.controls.desc.value,
      conditions: this.needPartnerForm.controls.conditions.value,
      experience: this.needPartnerForm.controls.experience.value,
      date: new Date(),
      phone: this.needPartnerForm.controls.phone.value,
      email: this.needPartnerForm.controls.email.value
    };

    this.sendOffer(offerData).then((ok) => {
      console.log(ok);
    }).catch((err) => {
      console.log(err);
    });
  }

}
