import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Offer} from "../../models/Offer";
import {FormControl, FormGroup} from "@angular/forms";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {AppService} from "../../services/app/app.service";
import {map, startWith} from "rxjs/operators";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OverlayService} from "../../services/overlay/overlay.service";
import {ActivatedRoute} from "@angular/router";
import {DatabaseService} from "../../services/database/database.service";
import {FilterField, FilterFieldName, FilterFieldOperator} from "../../models/FilterFields";

@Component({
  selector: 'app-offers-page',
  templateUrl: './offers-page.component.html',
  styleUrls: ['./offers-page.component.scss']
})
export class OffersPageComponent extends ComponentBrowserAbstractClass implements OnInit {

  private readonly metaTags = {
    title: 'Доска предложений | BizMate',
    description: 'Здесь Вы найдете подходящее бизнес-предложение по партнерсту, инвестициям или покупке/продаже готового проекта, используя фильтры по регионам, сферам бизнеса и типам предложений.',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: '/offers-page'
  };

  public sortedOffers$: Observable<Offer[]> = undefined;
  public filteredOffers$: Observable<Offer[]> = undefined;
  public emptyFilterResult: boolean = false;

  // Панель поиска
  public searchForm: FormGroup;
  public filteredOfferTypes$: Observable<any[]>;
  public filteredBusinessArea$: Observable<BusinessArea[]>;
  public filteredCities$: Observable<City[]>;
  public isSearchFormVisible: boolean = false;

  constructor(private appService: AppService, private notificationService: NotificationBarService, private seoService: SeoService,
              private route: ActivatedRoute, private databaseService: DatabaseService) {
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

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.databaseService.clearSortedOffers();
  }

  private async getSortedOffers(loadNextChunk: boolean = false): Promise<void> {
    OverlayService.showOverlay();
    this.databaseService.getSortedOffersChunk(loadNextChunk)
      .then((res) => this.sortedOffers$ = res)
      .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      .finally(() => OverlayService.hideOverlay());
  }

  public async applyFilter(loadNextChunk: boolean = false): Promise<void> {
    if (!this.searchForm.valid) {
      this.notificationService.showNotificationBar(Messages.OFFERS_FILTER_ERROR, false);
      return;
    }

    OverlayService.showOverlay();

    let queryParams = this.getSearchFormParams();
    if (!queryParams.length) {
      OverlayService.hideOverlay();
      return;
    }

    this.databaseService.getFilteredOffersChunk(queryParams, loadNextChunk)
      .then((res) => {
        if (res) {
          this.filteredOffers$ = res;
          this.emptyFilterResult = false;
        } else {
          this.filteredOffers$ = undefined;
          this.emptyFilterResult = true
        }
        //@ts-ignore
        ym(65053642,'reachGoal','searchByFilter');
      })
      .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      .finally(() => OverlayService.hideOverlay())
  }

  private getSearchFormParams(): any {
    let formValue = this.searchForm.getRawValue();
    let queryParams: FilterField[] = [];

    if (formValue.type && formValue.type.length)
      queryParams.push({
        value: AppService.getOfferTypeByFiledValue('title', formValue.type).id,
        operator: FilterFieldOperator.EQUALS,
        name: FilterFieldName.OFFER_TYPE
      });

    if (formValue.city && formValue.city.length)
      queryParams.push({
        value: AppService.getCityByFiledValue('name', formValue.city).id,
        operator: FilterFieldOperator.EQUALS,
        name: FilterFieldName.CITY
      });


    if (formValue.businessArea && formValue.businessArea.length) {
      if (AppService.getBusinessAreaByFiledValue('name', formValue.businessArea).id > 0) {
        queryParams.push({
          value: AppService.getBusinessAreaByFiledValue('name', formValue.businessArea).id,
          operator: FilterFieldOperator.INCLUDES,
          name: FilterFieldName.BUSINESS_AREA
        });

      }
    }

    return queryParams;
  }

  public clearFilterForm(): void {
    this.emptyFilterResult = false;
    this.searchForm.reset();

    Object.keys(this.searchForm.controls).forEach(key => {
      this.searchForm.get(key).setErrors(null);
    });

    this.filteredOffers$ = null;

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
    if ((this.filteredOffers$ && this.databaseService.areAllFilteredOffersLoaded()) ||
      (!this.filteredOffers$ && this.databaseService.areAllSortedOffersLoaded())) {
      return false;
    }
    return !this.emptyFilterResult;
  }
}
