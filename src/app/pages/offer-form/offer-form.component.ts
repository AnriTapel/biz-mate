import {Component, OnInit} from '@angular/core';
import {OfferTypes} from "../../models/OfferTypes";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {AngularFirestore} from "@angular/fire/firestore";
import * as firebase from "firebase";
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {ActivatedRoute, Router} from "@angular/router";
import {Offer} from "../../models/Offer";

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss']
})
export class OfferFormComponent implements OnInit {

  private currentType: number = 1;

  editOffer: boolean = false;
  editOfferId: string = null;
  isOfferLoaded: boolean = false;

  newOfferForm: FormGroup;
  filteredBusinessArea$: Observable<BusinessArea[]>;
  filteredCities$: Observable<City[]>;
  fieldsLabels: any = null;
  contactDataState: any = {
    phone: {enabled: true, insert: true},
    email: {enabled: true, insert: true},
  };
  
  readonly successText: string = "Ваше предложение успешно отправлено";
  readonly errorText: string = "При отправке произошла ошибка. Попробуйте еще раз.";
  offerType = OfferTypes;

  constructor(private db: AngularFirestore, private auth: AuthService, private activeRoute: ActivatedRoute,
              private router: Router) {
  }

  async ngOnInit(): Promise<void> {
    const offerData = await this.getUserAccountData();
    this.newOfferForm = new FormGroup({
      city: new FormControl(offerData.city, [Validators.required, AppService.cityFieldValidator()]),
      businessArea: new FormControl(offerData.businessArea, [Validators.required, AppService.businessAreaFieldValidator()]),
      title: new FormControl(offerData.title, [Validators.required]),
      capital: new FormControl(offerData.capital, [this.capitalFieldValidator()]),
      desc: new FormControl(offerData.desc, [Validators.required]),
      experience: new FormControl(offerData.experience),
      conditions: new FormControl(offerData.conditions),
      phone: new FormControl(offerData.phone),
      email: new FormControl(offerData.email, [Validators.email])
    });

    this.resolveContactData();
    this.fieldsLabels = OfferFormComponent.getFieldsLabels(this.currentType);
    this.isOfferLoaded = true;

    this.filteredCities$ = this.newOfferForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterCities(value))
      );

    this.filteredBusinessArea$ = this.newOfferForm.controls.businessArea.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterCategories(value))
      );
  }

  public setOfferType(type: OfferTypes): void {
    if (this.currentType == type)
      return;

    this.currentType = type;
    this.newOfferForm.controls.experience.reset();
    this.newOfferForm.controls.conditions.reset();
    this.newOfferForm.controls.capital.reset();
    this.fieldsLabels = OfferFormComponent.getFieldsLabels(this.currentType);
  }

  public getOfferType(): OfferTypes {
    return this.currentType;
  }

  public getOfferTypesArray(): Array<any> {
    return AppService.offerTypes;
  }

  isCapitalFieldVisible(): boolean {
    return this.currentType == this.offerType.NEED_INVESTMENTS || this.currentType == this.offerType.HAVE_INVESTMENTS;
  }

  clearForm(): void {
    this.newOfferForm.reset();
  }

  async getUserAccountData(): Promise<any> {
    if (!this.auth.user) {
      this.router.navigateByUrl('/');
      return;
    }

    let offerData = {};
    // TODO: привести валидацию урлы в соответствующие вид
    if (this.activeRoute.snapshot.url[0].path == 'edit-offer') {
      this.editOffer = true;
      this.editOfferId = this.activeRoute.snapshot.url[1].path;
      let offerRef = await this.db.doc(`/offers/${this.editOfferId}`).ref.get();
      let offer = offerRef.data() as Offer;

      this.currentType = offer.type;
      offerData['offerId'] = offer.offerId || '';
      offerData['title'] = offer.title || '';
      offerData['desc'] = offer.desc || '';
      offerData['capital'] = offer.capital || null;
      offerData['experience'] = offer.experience || '';
      offerData['businessArea'] = AppService.getBusinessAreaByFiledValue('id', offer.businessArea).name || '';
      offerData['conditions'] = offer.conditions || '';
      offerData['phone'] = offer.phone || null;
      offerData['email'] = offer.email || null;
      offerData['city'] = AppService.getCityByFiledValue('id', this.auth.user.city).name || '';
    } else {
      offerData['phone'] = this.auth.user.phone || null;
      offerData['email'] = this.auth.user.email || null;
      if (this.auth.user.city)
        offerData['city'] = AppService.getCityByFiledValue('id', this.auth.user.city).name || '';
    }

    return offerData;
  }

  private resolveContactData(): void {
    if (!this.auth.user.phone || this.auth.user.phone == '') {
      this.contactDataState.phone.enabled = false;
      this.contactDataState.phone.insert = false;
    } else
      this.contactDataState.phone.insert = !!this.newOfferForm.controls.phone.value;

    if (!this.auth.user.email || this.auth.user.email == '') {
      this.contactDataState.email.enabled = false;
      this.contactDataState.email.insert = false;
    } else
      this.contactDataState.email.insert = !!this.newOfferForm.controls.email.value;
  }

  private capitalFieldValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let valid: boolean = true;
      if (this.getOfferType() == this.offerType.NEED_INVESTMENTS || this.getOfferType() ==
          this.offerType.HAVE_INVESTMENTS)
        valid = control.value && control.value != "";

      return !valid ? {'validArea': {value: control.value}} : null;
    };
  }

  sendOffer(): Promise<void> {
    let offerData = this.newOfferForm.getRawValue();

    if (this.newOfferForm.status == "INVALID")
      return;

    offerData.type = this.currentType;
    offerData.userId = this.auth.user ? this.auth.user.uid : null;
    offerData.city = AppService.getCityByFiledValue('name', offerData.city).id;
    offerData.businessArea = AppService.getBusinessAreaByFiledValue('name', offerData.businessArea).id;
    offerData.date = Date.now();
    offerData.offerId = this.editOfferId || this.db.createId();
    offerData.phone = this.contactDataState.phone.insert ? this.auth.user.phone : null;
    offerData.email = this.contactDataState.email.insert ? this.auth.user.email : null;

    if (this.auth.user && this.auth.user.profilePhoto)
      offerData.profilePhoto = this.auth.user.profilePhoto;
    else
      offerData.profilePhoto = AppService.getDefaultAvatar();

    let ref = this.db.collection('/offers');

    let request = this.editOffer ? ref.doc(offerData.offerId).update(offerData) : ref.doc(offerData.offerId).set(offerData);
    return request
      .then(() => {
        console.log(this.successText);
      })
      .catch((e) => {
        console.log(e);
        console.log(this.errorText);
      })
  }

  private static getFieldsLabels(offerType: OfferTypes): object {
    return AppService.offerFieldsLabels[offerType - 1];
  }
}
