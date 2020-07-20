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
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss']
})
export class OfferFormComponent extends ComponentBrowserAbstractClass implements OnInit {

  private currentType: number = 1;

  private editOfferId: string = null;
  public editOffer: boolean = false;
  public isOfferLoaded: boolean = false;

  public newOfferForm: FormGroup;
  public filteredBusinessArea$: Observable<BusinessArea[]>;
  public filteredCities$: Observable<City[]>;
  public fieldsLabels: any = null;
  public offerImages: string[] = [];
  private removedImages: string[] = [];
  public contactMethods: any = {
    email: true,
    phone: true,
    whatsapp: false,
    telegram: false,
    viber: false
  };

  public isFormValid: boolean = true;
  private offerType = OfferTypes;

  private readonly metaTags = {
    title: 'Разместить предложение | BizMate',
    description: 'Составьте и разместите в сервисе BizMate предложение о поиске партнера по бизнесу, поиску и предложения инвестиций, а также покупке или продаже бизнеса.',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: '/new-offer'
  };

  constructor(private db: AngularFirestore, private auth: AuthService, private activeRoute: ActivatedRoute,
              private notificationBarService: NotificationBarService, private seoService: SeoService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    const offerData = await this.getOfferData();
    this.newOfferForm = new FormGroup({
      city: new FormControl(offerData.city, [Validators.required, AppService.cityFieldValidator()]),
      businessArea: new FormControl(offerData.businessArea, [Validators.required, AppService.businessAreaFieldValidator()]),
      title: new FormControl(offerData.title, [Validators.required]),
      capital: new FormControl(offerData.capital, [this.capitalFieldValidator()]),
      desc: new FormControl(offerData.desc, [Validators.required]),
      experience: new FormControl(offerData.experience),
      conditions: new FormControl(offerData.conditions),
      phone: new FormControl(offerData.phone, [Validators.pattern(/^\+7 \(\d{3}\)\s\d{3}-\d{4}$/)])
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
    AppService.showOverlay();
    for (let i = 0; i < imgCount; i++) {
      let res = await this.auth.uploadUserImage(files[i]);
      if (res)
        this.offerImages.push(res);
      else {
        this.notificationBarService.showNotificationBar(Messages["image/could_not_load"], false);
      }
    }
    AppService.hideOverlay();
  }

  public openImage(url: string): void {
    if (AppService.isPlatformBrowser()) {
      window.open(url, '_blank');
    }
  }

  public deleteImage(image: string): void {
    this.removedImages.push(image);
    this.offerImages = this.offerImages.filter(it => it !== image);
  }

  public isCapitalFieldVisible(): boolean {
    return this.currentType == this.offerType.NEED_INVESTMENTS || this.currentType == this.offerType.HAVE_INVESTMENTS ||
      this.currentType == this.offerType.SELL_BUSINESS;
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
    if (this.activeRoute.snapshot.url[0] && this.activeRoute.snapshot.url[0].path == 'edit-offer') {
      AppService.showOverlay();
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
      AppService.hideOverlay();
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

    AppService.showOverlay();

    for (let img of this.removedImages) {
      this.auth.deleteUserImage(img);
    }

    offerData.type = this.currentType;
    offerData.displayName = this.auth.user.displayName;
    offerData.userId = this.auth.user.uid;
    offerData.city = AppService.getCityByFiledValue('name', offerData.city).id;
    offerData.businessArea = AppService.getBusinessAreaByFiledValue('name', offerData.businessArea).id;
    offerData.date = Date.now();
    offerData.offerId = this.editOfferId || this.db.createId();
    offerData.email = this.auth.user.email;
    offerData.photoURL = this.auth.user.photoURL || AppService.getDefaultAvatar();
    offerData.imagesURL = this.offerImages;
    offerData.contactMethods = this.contactMethods;

    let ref = this.db.collection('/offers');

    let request = this.editOffer ? ref.doc(offerData.offerId).update(offerData) : ref.doc(offerData.offerId).set(offerData);
    return request
      .then(() => {
        AppService.hideOverlay();
        this.notificationBarService.showNotificationBar(this.editOffer ? Messages.SAVE_SUCCESS : Messages.OFFER_CREATED, true);
      })
      .catch(() => {
        AppService.hideOverlay();
        this.notificationBarService.showNotificationBar(this.editOffer ? Messages.SAVE_ERROR : Messages.OFFER_ERROR, false);
      })
  }

  private static getFieldsLabels(offerType: OfferTypes): object {
    return AppService.offerFieldsLabels[offerType - 1];
  }
}
