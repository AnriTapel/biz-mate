import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {Meta, Title} from "@angular/platform-browser";
import {SeoService} from "../../services/seo/seo.service";

@Component({
  selector: 'app-offers-page',
  templateUrl: './offers-page.component.html',
  styleUrls: ['./offers-page.component.scss']
})
export class OffersPageComponent implements OnInit, OnDestroy {

  private readonly OFFER_QUERY_LIMIT: number = 20;
  private readonly metaTags = {
    title: 'Доска предложений | BizMate',
    description: 'Здесь Вы найдете подходящее бизнес-предложение по партнерсту, инвестициям или покупке/продаже готового проекта, используя фильтры по регионам, сферам бизнеса и типам предложений.',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: location.href
  };

  private lastVisibleOffer: any = null;
  public allOffersLoaded: boolean = false;
  public emptyFilterResult: boolean = false;

  private offersRef: any;
  public sortedOffers$: Observable<any[]>;
  public filteredOffers$: Observable<Offer[]>;

  // Панель поиска
  public searchForm: FormGroup;
  public filteredOfferTypes$: Observable<any[]>;
  public filteredBusinessArea$: Observable<BusinessArea[]>;
  public filteredCities$: Observable<City[]>;
  public isSearchFormVisible: boolean = false;

  constructor(private appService: AppService, private db: AngularFirestore, private notificationService: NotificationBarService,
              private seoService: SeoService) {
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    AppService.showOverlay();
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
        map(value => AppService._filterCategories(value))
      );
    this.offersRef = this.db.collection('offers').ref;
    this.getInitialOffers().finally(() => AppService.hideOverlay());
  }

  ngOnDestroy(): void {
    window.scrollTo(0,0);
  }

  private async getInitialOffers(): Promise<void> {
    let initialQuery = await this.offersRef.orderBy('date', 'desc').limit(this.OFFER_QUERY_LIMIT).get();

    let offers = [];

    if (!initialQuery.empty) {
      initialQuery.forEach(it => offers.push(it.data()));
      this.lastVisibleOffer = initialQuery.docs[initialQuery.docs.length - 1];

      this.sortedOffers$ = of(offers);
    }
  }

  public async applyFilter(): Promise<void> {
    if (this.searchForm.status === 'INVALID')
      return;

    this.emptyFilterResult = false;

    let formValue = this.searchForm.getRawValue();
    let queryParams = [];

    if (formValue.type && formValue.type.length)
      queryParams.push('type', AppService.getOfferTypeByFiledValue('title', formValue.type).id);

    if (formValue.city && formValue.city.length)
      queryParams.push('city', AppService.getCityByFiledValue('name', formValue.city).id);

    if (formValue.businessArea && formValue.businessArea.length)
      queryParams.push('city', AppService.getBusinessAreaByFiledValue('name', formValue.businessArea).id);

    try {
      switch (queryParams.length) {
        case 2:
          await this.applyOneParamFilter(queryParams[0], queryParams[1]);
          break;
        case 4:
          await this.applyTwoParamFilter(queryParams[0], queryParams[1], queryParams[2], queryParams[3]);
          break;
        default:
          await this.applyThreeParamFilter(queryParams[0], queryParams[1], queryParams[2], queryParams[3], queryParams[4], queryParams[5]);
          break;
      }
    } catch (e) {
      this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false);
      this.filteredOffers$ = null;
    }
  }

  private async applyOneParamFilter(param: string, value: number): Promise<void> {
    let resp = await this.offersRef.where(param, '==', value).get();
    let filterRes = [];
    if (!resp.empty) {
      resp.forEach(it => filterRes.push(it.data()));
      this.filteredOffers$ = of<Offer[]>(filterRes.sort((a,b) => b.date - a.date));
    } else {
      this.emptyFilterResult = true;
      this.filteredOffers$ = null;
    }
  }

  private async applyTwoParamFilter(param_1, value_1, param_2, value_2): Promise<void> {
    let resp = await this.offersRef.where(param_1, '==', value_1).where(param_2, '==', value_2).get();
    let filterRes = [];
    if (!resp.empty) {
      resp.forEach(it => filterRes.push(it.data()));
      this.filteredOffers$ = of<Offer[]>(filterRes.sort((a,b) => b.date - a.date));
    } else {
      this.emptyFilterResult = true;
      this.filteredOffers$ = null;
    }
  }

  private async applyThreeParamFilter(param_1, value_1, param_2, value_2, param_3, value_3): Promise<void> {
    let resp = await this.offersRef.where(param_1, '==', value_1).where(param_2, '==', value_2)
      .where(param_3, '==', value_3).get();
    let filterRes = [];
    if (!resp.empty) {
      resp.forEach(it => filterRes.push(it.data()));
      this.filteredOffers$ = of<Offer[]>(filterRes.sort((a,b) => b.date - a.date));
    } else {
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
  }

  public async loadNextOffersChunk(): Promise<void> {
    let query = await this.db.collection<Offer>('/offers').ref
      .orderBy('date', 'desc').limit(this.OFFER_QUERY_LIMIT).startAfter(this.lastVisibleOffer).get();

    let offers = [];

    if (!query.empty) {
      query.forEach(it => offers.push(it.data()));
      this.lastVisibleOffer = query.docs[query.docs.length - 1];

      this.sortedOffers$ = zip(this.sortedOffers$, of(offers))
        .pipe(map(x => x[0].concat(x[1])))
    } else {
      this.allOffersLoaded = true
    }
  }
}
