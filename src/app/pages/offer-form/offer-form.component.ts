import {Component, OnInit} from '@angular/core';
import {OfferTypes} from "../../models/OfferTypes";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {AngularFirestore} from "@angular/fire/firestore";
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {ActivatedRoute} from "@angular/router";
import {Offer} from "../../models/Offer";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import * as firebase from 'firebase/app';
import 'firebase/storage';

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
  offerImages: string[] = [];
  removedImages: string[] = [];
  attacheEmail: boolean = true;
  contactMethods: any = {
    email: true,
    phone: true,
    whatsapp: false,
    telegram: false,
    viber: false
  };

  isFormValid: boolean = true;
  offerType = OfferTypes;

  constructor(private db: AngularFirestore, private auth: AuthService, private activeRoute: ActivatedRoute,
              private notificationBarService: NotificationBarService) {
  }

  async ngOnInit(): Promise<void> {
    const offerData = await this.getOfferData();
    this.newOfferForm = new FormGroup({
      city: new FormControl(offerData.city, [Validators.required, AppService.cityFieldValidator()]),
      businessArea: new FormControl(offerData.businessArea, [Validators.required, AppService.businessAreaFieldValidator()]),
      title: new FormControl(offerData.title, [Validators.required]),
      capital: new FormControl(offerData.capital, [this.capitalFieldValidator()]),
      desc: new FormControl(offerData.desc, [Validators.required]),
      experience: new FormControl(offerData.experience),
      conditions: new FormControl(offerData.conditions),
      phone: new FormControl(offerData.phone, [Validators.required, Validators.pattern(/^\+7 \(\d{3}\)\s\d{3}-\d{4}$/)])
    });

    this.newOfferForm.valueChanges.subscribe(() => this.isFormValid = true);
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

    scroll(0,0);
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

  public async fileChangeEvent(event): Promise<void> {
    let files = event.target.files;
    let imgCount = files.length > 5 ? 5 : files.length;
    for (let i = 0; i < imgCount; i++) {
      let fileName = files[i].name;
      try {
        await firebase.storage().ref().child(fileName).getDownloadURL();
        fileName = `${Date.now()}_${fileName}`;
      } catch (err) {
        console.warn(`File with name ${fileName} doesn't exist.`);
      }

      let imageRef = firebase.storage().ref().child(fileName);

      let uploadRef = await imageRef.put(files[i]);
      if (uploadRef.state === 'success') {
        let photoURL = await uploadRef.ref.getDownloadURL();
        this.offerImages.push(photoURL);
      }
    }
  }

  public openImage(url: string): void {
    window.open(url, '_blank');
  }

  public deleteImage(image: string): void {
    this.removedImages.push(image);
    this.offerImages = this.offerImages.filter(it => it !== image);
  }

  public isCapitalFieldVisible(): boolean {
    return this.currentType == this.offerType.NEED_INVESTMENTS || this.currentType == this.offerType.HAVE_INVESTMENTS;
  }

  public isPhoneValid(): boolean {
    const phone = this.newOfferForm.controls['phone'];
    return phone.value && phone.value.length && phone.status === 'VALID';
  }

  public clearForm(): void {
    this.newOfferForm.reset();
  }

  public async getOfferData(): Promise<any> {
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
      offerData['city'] = AppService.getCityByFiledValue('id', offer.city).name || '';
      this.contactMethods = offer.contactMethods || this.contactMethods;
      this.offerImages = offer.imagesURL || [];
      this.attacheEmail = !!offerData['email'];
    }

    return offerData;
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

  public sendOffer(): Promise<void> {
    let offerData: Offer = this.newOfferForm.getRawValue();

    if (this.newOfferForm.status == "INVALID") {
      this.isFormValid = false;
      return;
    }

    for (let img of this.removedImages) {
      firebase.storage().refFromURL(img).delete().catch(() => console.error(`Error occured while deleting image ${img}`));
    }

    offerData.type = this.currentType;
    offerData.displayName = this.auth.user.displayName;
    offerData.userId = this.auth.user.uid;
    offerData.city = AppService.getCityByFiledValue('name', offerData.city).id;
    offerData.businessArea = AppService.getBusinessAreaByFiledValue('name', offerData.businessArea).id;
    offerData.date = Date.now();
    offerData.offerId = this.editOfferId || this.db.createId();
    offerData.email = this.attacheEmail ? this.auth.user.email : null;
    offerData.photoURL = this.auth.user.photoURL || AppService.getDefaultAvatar();
    offerData.imagesURL = this.offerImages;
    if (!this.attacheEmail)
      this.contactMethods.email = false;
    offerData.contactMethods = this.contactMethods;

    let ref = this.db.collection('/offers');

    let request = this.editOffer ? ref.doc(offerData.offerId).update(offerData) : ref.doc(offerData.offerId).set(offerData);
    return request
      .then(() => {
        this.notificationBarService.showNotificationBar(this.editOffer ? Messages.SAVE_SUCCESS : Messages.OFFER_CREATED, true);
      })
      .catch(() => {
        this.notificationBarService.showNotificationBar(this.editOffer ? Messages.SAVE_ERROR : Messages.OFFER_ERROR, false);
      })
  }

  private static getFieldsLabels(offerType: OfferTypes): object {
    return AppService.offerFieldsLabels[offerType - 1];
  }
}
