import {Component, OnInit, ViewChild} from '@angular/core';
import {OfferTypes} from "../../models/OfferTypes";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {AbstractControl, FormControl, FormGroup, FormGroupDirective, ValidatorFn, Validators} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {ActivatedRoute, Router} from "@angular/router";
import {Offer} from "../../models/Offer";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OverlayService} from "../../services/overlay/overlay.service";
import {StorageService} from "../../services/storage/storage.service";
import {DatabaseService} from "../../services/database/database.service";

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss']
})
export class OfferFormComponent extends ComponentBrowserAbstractClass implements OnInit {

  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  private currentType: number = undefined;

  private editOfferId: string = null;
  private _areChangesSaved: boolean = true;
  private offerDate: number = undefined;
  public editOffer: boolean = false;
  public isOfferLoaded: boolean = false;
  public isTouchableDevice: boolean = AppService.isTouchableDevice();

  public newOfferForm: FormGroup;
  public filteredBusinessArea$: Observable<BusinessArea[]>;
  public filteredExtraBusinessArea$: Observable<BusinessArea[]>;
  public filteredCities$: Observable<City[]>;
  public fieldsLabels: any = null;
  public readonly fieldMaxLength = {
    title: 64,
    desc: 1024,
    experience: 1024,
    conditions: 1024
  };
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
  public isExtraBusinessAreaFieldAvail: boolean = false;
  private offerType = OfferTypes;

  private readonly metaTags = {
    title: 'Разместить предложение | BizMate',
    description: 'Составьте и разместите в сервисе BizMate предложение о поиске партнера по бизнесу, поиску и предложения инвестиций, а также покупке или продаже бизнеса.',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: '/new-offer'
  };

  constructor(private auth: AuthService, private activeRoute: ActivatedRoute, private storageService: StorageService,
              private notificationBarService: NotificationBarService, private seoService: SeoService, private router: Router,
              private databaseService: DatabaseService, private appService: AppService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    const offerData = await this.getOfferData();
    this.newOfferForm = new FormGroup({
      city: new FormControl(offerData.city, [Validators.required, this.appService.cityFieldValidator()]),
      businessArea: new FormControl(offerData.businessArea, [Validators.required, this.appService.businessAreaFieldValidator()]),
      extraBusinessArea: new FormControl(offerData.extraBusinessArea, [this.appService.businessAreaFieldValidator()]),
      title: new FormControl(offerData.title, [Validators.required, Validators.maxLength(this.fieldMaxLength.title)]),
      capital: new FormControl(offerData.capital, [this.capitalFieldValidator()]),
      desc: new FormControl(offerData.desc, [Validators.required, Validators.maxLength(this.fieldMaxLength.desc)]),
      experience: new FormControl(offerData.experience, [Validators.maxLength(this.fieldMaxLength.experience)]),
      conditions: new FormControl(offerData.conditions, [Validators.maxLength(this.fieldMaxLength.conditions)]),
      phone: new FormControl(offerData.phone, [Validators.pattern(/^\+7 \(\d{3}\)\s\d{3}-\d{4}$/)])
    });

    if (offerData.type) {
      this.setOfferType(offerData.type, false);
      this.fieldsLabels = OfferFormComponent.getFieldsLabels(offerData.type);
    }

    this.newOfferForm.valueChanges.subscribe(() => this.isFormValid = true);
    this.isOfferLoaded = true;

    this.filteredCities$ = this.newOfferForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterCities(value))
      );

    this.filteredBusinessArea$ = this.newOfferForm.controls.businessArea.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterBusinessAreas(value))
      );

    this.filteredExtraBusinessArea$ = this.newOfferForm.controls.extraBusinessArea.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterBusinessAreas(value))
      );

    this.newOfferForm.valueChanges.subscribe(() => this.areChangesSaved = false);
  }

  public setOfferType(type: OfferTypes, resetControls: boolean = true): void {
    if (this.currentType == type)
      return;

    this.currentType = type;
    this.fieldsLabels = OfferFormComponent.getFieldsLabels(this.currentType);
    if (resetControls) {
      this.newOfferForm.controls.experience.reset();
      this.newOfferForm.controls.conditions.reset();
      this.newOfferForm.controls.capital.reset();
    }
  }

  public getOfferType(): OfferTypes {
    return this.currentType;
  }

  public getOfferTypesArray(): any[] {
    return this.appService.offerTypes;
  }

  public getBusinessAreas(): BusinessArea[] {
    return this.appService.businessAreas;
  }

  public async fileChangeEvent(event): Promise<void> {
    let files = event.target.files;
    let imgCount = files.length > 5 ? 5 : files.length;
    OverlayService.showOverlay();
    for (let i = 0; i < imgCount; i++) {
      let res = await this.storageService.uploadUserImage(files[i], files[i].name);
      if (res)
        this.offerImages.push(res);
      else {
        this.notificationBarService.showNotificationBar(Messages["image/could_not_load"], false);
      }
    }
    OverlayService.hideOverlay();
  }

  public openImage(url: string): void {
    window.open(url, '_blank');
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
    return phone.value && phone.value.length && phone.valid;
  }

  public clearForm(): void {
    setTimeout(() => this.formGroupDirective.resetForm(), 0);
  }

  public async getOfferData(): Promise<any> {
    let offerData = {};
    if (this.activeRoute.snapshot.params && this.activeRoute.snapshot.params.offerId) {
      OverlayService.showOverlay();
      this.editOffer = true;
      this.editOfferId = this.activeRoute.snapshot.params.offerId;
      let offer: Offer;
      try {
        offer = await this.databaseService.getOfferByOfferId(this.editOfferId);
      } catch (e) {
        this.router.navigateByUrl('/not-found');
        OverlayService.hideOverlay();
        return;
      }

      offerData['type'] = offer.type;
      offerData['offerId'] = offer.offerId || null;
      offerData['title'] = offer.title || null;
      offerData['desc'] = offer.desc || null;
      offerData['capital'] = offer.capital || null;
      offerData['experience'] = offer.experience || null;
      offerData['businessArea'] = this.appService.getBusinessAreaByFiledValue('id', offer.businessArea[0]).name || null;
      if (offer.businessArea[1]) {
        offerData['extraBusinessArea'] = this.appService.getBusinessAreaByFiledValue('id', offer.businessArea[1]).name || null;
        this.isExtraBusinessAreaFieldAvail = true;
      }
      offerData['conditions'] = offer.conditions || null;
      offerData['phone'] = offer.phone || null;
      offerData['city'] = this.appService.getCityByFiledValue('id', offer.city).name || null;
      this.contactMethods = offer.contactMethods || this.contactMethods;
      this.offerImages = offer.imagesURL || [];
      this.offerDate = offer.date;

      OverlayService.hideOverlay();
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
    if (!this.newOfferForm.valid) {
      this.isFormValid = false;
      return;
    }

    OverlayService.showOverlay();
    let offerData = this.newOfferForm.getRawValue();

    for (let key of Object.keys(offerData)) {
      offerData[key] = offerData[key] === "" ? null : offerData[key];
    }

    offerData.type = this.currentType;
    offerData.displayName = this.auth.user.displayName;
    offerData.userId = this.auth.user.uid;
    offerData.city = this.appService.getCityByFiledValue('name', offerData.city).id;
    let areas = [this.appService.getBusinessAreaByFiledValue('name', offerData.businessArea).id];
    if (offerData.extraBusinessArea && offerData.extraBusinessArea.length > 0) {
      areas.push(this.appService.getBusinessAreaByFiledValue('name', offerData.extraBusinessArea).id);
    }
    offerData.businessArea = areas;
    offerData.date = this.offerDate || Date.now();
    offerData.offerId = this.editOfferId || this.databaseService.createId();
    offerData.email = this.auth.user.email;
    offerData.photoURL = this.auth.user.photoURL || AppService.getDefaultAvatar();
    offerData.imagesURL = this.offerImages;
    offerData.contactMethods = offerData.phone ? this.contactMethods : null;

    this.databaseService.sendOffer(offerData, this.removedImages, this.editOffer)
      .then(() => {
        this.removedImages = [];
        this.areChangesSaved = true;
        this.notificationBarService.showNotificationBar(this.editOffer ? Messages.SAVE_SUCCESS : Messages.OFFER_CREATED, true);
        if (this.editOffer) {
          //@ts-ignore
          ym(65053642,'reachGoal','offerEdited')
        } else {
          //@ts-ignore
          ym(65053642,'reachGoal','offerCreated');
        }
        this.router.navigateByUrl(`/offer/${offerData.offerId}`);
      })
      .catch(() => this.notificationBarService.showNotificationBar(this.editOffer ? Messages.SAVE_ERROR : Messages.OFFER_ERROR, false))
      .finally(() => OverlayService.hideOverlay());
  }

  private static getFieldsLabels(offerType: OfferTypes): object {
    return AppService.offerFieldsLabels[offerType - 1];
  }

  get areChangesSaved(): boolean {
    return this._areChangesSaved;
  }

  set areChangesSaved(value: boolean) {
    this._areChangesSaved = value;
  }
}
