import {Component, OnInit} from '@angular/core';
import {Observable, of, zip} from "rxjs";
import {Offer} from "../../models/Offer";
import {FormControl, FormGroup} from "@angular/forms";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {AppService} from "../../services/app/app.service";
import {map, startWith} from "rxjs/operators";
import {AngularFirestore} from "@angular/fire/firestore";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OverlayService} from "../../services/overlay/overlay.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-offers-page',
  templateUrl: './offers-page.component.html',
  styleUrls: ['./offers-page.component.scss']
})
export class OffersPageComponent extends ComponentBrowserAbstractClass implements OnInit {

  private readonly OFFER_QUERY_LIMIT: number = 20;
  private readonly metaTags = {
    title: 'Доска предложений | BizMate',
    description: 'Здесь Вы найдете подходящее бизнес-предложение по партнерсту, инвестициям или покупке/продаже готового проекта, используя фильтры по регионам, сферам бизнеса и типам предложений.',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: '/offers-page'
  };

  private lastSortedOffer: any = null;
  private lastFilteredOffer: any = null;
  public allSortedOffersLoaded: boolean = false;
  public allFilteredOffersLoaded: boolean = false;
  public emptyFilterResult: boolean = false;

  private offersRef: any;
  public sortedOffers$: Observable<any[]> = null;
  public filteredOffers$: Observable<Offer[]> = null;

  // Панель поиска
  public searchForm: FormGroup;
  public filteredOfferTypes$: Observable<any[]>;
  public filteredBusinessArea$: Observable<BusinessArea[]>;
  public filteredCities$: Observable<City[]>;
  public isSearchFormVisible: boolean = false;

  constructor(private appService: AppService, private db: AngularFirestore, private notificationService: NotificationBarService,
              private seoService: SeoService, private route: ActivatedRoute) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.searchForm = new FormGroup({
      type: new FormControl(null, [AppService.offerTypeValidator()]),
      businessArea: new FormControl(null, [AppService.businessAreaFieldValidator()]),
      city: new FormControl(null, [AppService.cityFieldValidator()])
    });

    this.filteredOfferTypes$ = this.searchForm.controls.type.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterOfferTypes(value))
      );

    this.filteredCities$ = this.searchForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterCities(value))
      );

    this.filteredBusinessArea$ = this.searchForm.controls.businessArea.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterBusinessAreas(value))
      );
    this.offersRef = this.db.collection('offers').ref;

    this.route.queryParams.subscribe(res => {
      if (!res || Object.keys(res).length > 0) {
        let offerType = res.offerType ? AppService.getOfferTypeByFiledValue('id', res.offerType).title : null;
        let city = res.city ? AppService.getCityByFiledValue('id', res.city).name : null;
        let businessArea = res.businessArea ? AppService.getBusinessAreaByFiledValue('id', res.businessArea).name : null;
        this.searchForm.controls.type.setValue(offerType);
        this.searchForm.controls.city.setValue(city);
        this.searchForm.controls.businessArea.setValue(businessArea);
        this.applyFilter(false);
      } else {
        this.getSortedOffers(false);
      }
    });
  }

  private async getSortedOffers(loadNextChunk: boolean = false): Promise<void> {
    OverlayService.showOverlay();
    try {
      let query;
      if (loadNextChunk) {
        query = await this.offersRef.orderBy('date', 'desc')
          .limit(this.OFFER_QUERY_LIMIT).startAfter(this.lastSortedOffer).get();
      } else {
        query = await this.offersRef.orderBy('date', 'desc').limit(this.OFFER_QUERY_LIMIT).get();
      }

      let offers = [];
      if (!query.empty) {
        query.forEach(it => offers.push(it.data()));
        this.lastSortedOffer = query.docs[query.docs.length - 1];
        if (offers.length < this.OFFER_QUERY_LIMIT) {
          this.allSortedOffersLoaded = true;
        }

        if (loadNextChunk) {
          this.sortedOffers$ = zip(this.sortedOffers$, of(offers))
            .pipe(map(x => x[0].concat(x[1])));
        } else {
          this.sortedOffers$ = of(offers);
        }
      } else if (loadNextChunk){
        this.allSortedOffersLoaded = true;
      }
      OverlayService.hideOverlay();
    } catch (e){
      this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false);
      OverlayService.hideOverlay();
    }
  }

  public async applyFilter(loadNextChunk: boolean = false): Promise<void> {
    if (this.searchForm.status === 'INVALID')
      return;

    OverlayService.showOverlay();
    this.emptyFilterResult = false;
    if (!loadNextChunk) {
      this.allFilteredOffersLoaded = false;
      this.lastFilteredOffer = null;
    }

    let queryParams = this.getSearchFormParams();
    let paramsKeys = Object.keys(queryParams);
    if (!paramsKeys.length) {
      OverlayService.hideOverlay();
      return;
    }

    try {
      let resp;
      if (paramsKeys.length === 1) {
        if (loadNextChunk) {
          resp = await this.offersRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .limit(this.OFFER_QUERY_LIMIT).startAfter(this.lastFilteredOffer).get();
        } else {
          resp = await this.offersRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .limit(this.OFFER_QUERY_LIMIT).get();
        }
      } else if (paramsKeys.length === 2) {
        if (loadNextChunk) {
          resp = await this.offersRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .where(paramsKeys[1], '==', queryParams[paramsKeys[1]])
            .limit(this.OFFER_QUERY_LIMIT)
            .startAfter(this.lastFilteredOffer).get();
        } else {
          resp = await this.offersRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .where(paramsKeys[1], '==', queryParams[paramsKeys[1]])
            .limit(this.OFFER_QUERY_LIMIT).get();
        }
      } else if (paramsKeys.length === 3) {
        if (loadNextChunk) {
          resp = await this.offersRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .where(paramsKeys[1], '==', queryParams[paramsKeys[1]])
            .where(paramsKeys[2], '==', queryParams[paramsKeys[2]])
            .limit(this.OFFER_QUERY_LIMIT)
            .startAfter(this.lastFilteredOffer).get();
        } else {
          resp = await this.offersRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .where(paramsKeys[1], '==', queryParams[paramsKeys[1]])
            .where(paramsKeys[2], '==', queryParams[paramsKeys[2]])
            .limit(this.OFFER_QUERY_LIMIT).get();
        }
      }

      this.resolveFilterQuery(resp, loadNextChunk);
      OverlayService.hideOverlay();
    } catch (e) {
      this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false);
      this.filteredOffers$ = null;
      this.lastFilteredOffer = null;
      this.allFilteredOffersLoaded = false;
      OverlayService.hideOverlay();
    }
  }

  private getSearchFormParams(): any {
    let formValue = this.searchForm.getRawValue();
    let queryParams = {};

    if (formValue.type && formValue.type.length)
      queryParams['type'] = AppService.getOfferTypeByFiledValue('title', formValue.type).id;

    if (formValue.city && formValue.city.length)
      queryParams['city'] = AppService.getCityByFiledValue('name', formValue.city).id;

    if (formValue.businessArea && formValue.businessArea.length) {
      if (AppService.getBusinessAreaByFiledValue('name', formValue.businessArea).id > 0) {
        queryParams['businessArea'] = AppService.getBusinessAreaByFiledValue('name', formValue.businessArea).id;
      }
    }

    return queryParams;
  }

  private resolveFilterQuery(resp: any, loadNextChunk: boolean): void {
    let filterRes = [];
    if (!resp.empty) {
      resp.forEach(it => filterRes.push(it.data()));

      if (loadNextChunk) {
        this.filteredOffers$ = zip(this.filteredOffers$, of(filterRes))
          .pipe(map(x => x[0].concat(x[1])));
        //@ts-ignore
        ym(65053642,'reachGoal','searchByFilter');
      } else {
        this.filteredOffers$ = of<Offer[]>(filterRes);
      }

      this.lastFilteredOffer = filterRes[filterRes.length - 1];
      if (filterRes.length < this.OFFER_QUERY_LIMIT) {
        this.allFilteredOffersLoaded = true;
      }
    } else if (!loadNextChunk) {
      this.emptyFilterResult = true;
      this.filteredOffers$ = null;
    }
  }

  public clearFilterForm(): void {
    this.emptyFilterResult = false;
    this.searchForm.reset();

    Object.keys(this.searchForm.controls).forEach(key => {
      this.searchForm.get(key).setErrors(null);
    });

    this.filteredOffers$ = null;
    this.lastFilteredOffer = null;
    this.allFilteredOffersLoaded = false;

    if (!this.sortedOffers$) {
      OverlayService.showOverlay();
      this.getSortedOffers().finally(() => OverlayService.hideOverlay());
    }
  }

  public async getNextOffersChunk(): Promise<void> {
    if (this.filteredOffers$) {
      this.applyFilter(true);
    } else {
      await this.getSortedOffers(true);
    }
  }

  public getNextOffersChunkButtonStatus(): boolean {
    if ((this.filteredOffers$ && this.allFilteredOffersLoaded) || (!this.filteredOffers$ && this.allSortedOffersLoaded)) {
      return false;
    }
    return !this.emptyFilterResult;


  }
}
