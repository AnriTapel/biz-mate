import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {ActivatedRoute, Router} from "@angular/router";
import {DatabaseService} from "../../services/database/database.service";
import {FilterField, FilterFieldName, FilterFieldOperator} from "../../models/FilterFields";
import {MatDialog} from "@angular/material/dialog";
import {OffersFilterFormComponent} from "../../dialogs/offers-filter-form/offers-filter-form.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {OfferType} from "../../models/IOfferType";

@Component({
  selector: 'app-offers-page',
  templateUrl: './offers-page.component.html',
  styleUrls: ['./offers-page.component.scss']
})
export class OffersPageComponent extends ComponentBrowserAbstractClass implements OnInit, OnDestroy {

  private readonly metaTags = {
    title: 'Доска предложений | BizMate',
    description: 'Здесь Вы найдете подходящее бизнес-предложение по партнерсту, инвестициям или покупке/продаже готового проекта, используя фильтры по регионам, сферам бизнеса и типам предложений.',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: '/offers-page'
  };

  private areQueryParamsInitialyResolved: boolean = false;
  private mobileFilterParamsText: string = '';
  private queryParamsHandler: any = undefined;
  private mobileFilterDialogHandler: any = undefined;

  public sortedOffers$: Observable<Offer[]> = undefined;
  public filteredOffers$: Observable<Offer[]> = undefined;
  public emptyFilterResult: boolean = false;

  // Панель поиска
  public searchForm: FormGroup;
  public filteredOfferTypes$: Observable<OfferType[]>;
  public filteredBusinessArea$: Observable<BusinessArea[]>;
  public filteredCities$: Observable<City[]>;
  public isTouchDevice: boolean = AppService.isTouchableDevice();

  constructor(private appService: AppService, private notificationService: NotificationBarService, private seoService: SeoService,
              private route: ActivatedRoute, private router: Router, private databaseService: DatabaseService, private dialog: MatDialog) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.searchForm = new FormGroup({
      [FilterFieldName.OFFER_TYPE]: new FormControl(null, [this.appService.offerTypeValidator()]),
      [FilterFieldName.BUSINESS_AREA]: new FormControl(null, [this.appService.businessAreaFieldValidator()]),
      [FilterFieldName.CITY]: new FormControl(null, [this.appService.cityFieldValidator()])
    });

    this.filteredOfferTypes$ = this.searchForm.controls.type.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterOfferTypes(value))
      );

    this.filteredCities$ = this.searchForm.controls.city.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterCities(value))
      );

    this.filteredBusinessArea$ = this.searchForm.controls.businessArea.valueChanges
      .pipe(
        startWith(''),
        map(value => this.appService._filterBusinessAreas(value))
      );

    this.resolveGetParams();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.databaseService.clearSortedOffers();
    AppService.unsubscribeHandler([this.queryParamsHandler, this.mobileFilterDialogHandler]);
  }

  private resolveGetParams(): void {
    this.queryParamsHandler = this.route.queryParams.subscribe(res => {
      this.mobileFilterParamsText = res && Object.keys(res).length ? ` | ${Object.keys(res).length}` : '';
      if (this.areQueryParamsInitialyResolved) {
        return;
      }

      if (res && Object.keys(res).length) {
        try {
          let offerType = res[FilterFieldName.OFFER_TYPE] ? this.appService.getOfferTypeByFiledValue('id', res[FilterFieldName.OFFER_TYPE]).title : null;
          let city = res[FilterFieldName.CITY] ? this.appService.getCityByFiledValue('id', res[FilterFieldName.CITY]).name : null;
          let businessArea = res[FilterFieldName.BUSINESS_AREA] ? this.appService.getBusinessAreaByFiledValue('id', res[FilterFieldName.BUSINESS_AREA]).name : null;
          if (businessArea || city || offerType) {
            this.searchForm.controls.type.setValue(offerType);
            this.searchForm.controls.city.setValue(city);
            this.searchForm.controls.businessArea.setValue(businessArea);
            this.applyFilter(false);
          } else {
            this.getSortedOffers(false);
          }
        } catch (e) {
          this.clearFilterForm();
        }
      } else {
        this.getSortedOffers(false);
      }
      this.areQueryParamsInitialyResolved = true;
    });
  }

  public getOfferTypes(): any[] {
    return this.appService.offerTypes;
  }

  public getBusinessAreas(): BusinessArea[] {
    return this.appService.businessAreas;
  }

  private async getSortedOffers(loadNextChunk: boolean = false): Promise<void> {
    OverlayService.showOverlay();
    this.databaseService.getSortedOffersChunk(loadNextChunk)
      .then((res) => this.sortedOffers$ = res)
      .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      .finally(() => OverlayService.hideOverlay());
  }

  /***
   *
   * If businessArea filter param is the only picked & equals "Any", result of such query will be sorted offers
   * Offers with area "Any" are included in any query with filter by businessArea
   *
   * @param loadNextChunk - whether user pressed "More offers" button or not
   */
  public async applyFilter(loadNextChunk: boolean = false): Promise<void> {
    if (!this.searchForm.valid) {
      this.notificationService.showNotificationBar(Messages.OFFERS_FILTER_ERROR, false);
      return;
    }

    OverlayService.showOverlay();
    let filterParams = this.getSearchFormParams();
    if (!filterParams.length) {
      OverlayService.hideOverlay();
      this.filteredOffers$ = null;
      await this.getSortedOffers(false);
      return;
    }

    this.databaseService.getFilteredOffersChunk(filterParams, loadNextChunk)
      .then((res) => {
        const queryParams = {};
        filterParams.forEach(it => queryParams[it.name] = it.value[0] ? it.value[0].toString() : it.value.toString());
        this.router.navigate([], {
          relativeTo: this.route, skipLocationChange: false,
          queryParams: queryParams
        });
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

  private getSearchFormParams(): FilterField[] {
    let formValue = this.searchForm.getRawValue();
    let queryParams: FilterField[] = [];

    if (formValue.type && formValue.type.length)
      queryParams.push({
        value: this.appService.getOfferTypeByFiledValue('title', formValue.type).id,
        operator: FilterFieldOperator.EQUALS,
        name: FilterFieldName.OFFER_TYPE
      });

    if (formValue.city && formValue.city.length)
      queryParams.push({
        value: this.appService.getCityByFiledValue('name', formValue.city).id,
        operator: FilterFieldOperator.EQUALS,
        name: FilterFieldName.CITY
      });


    if (formValue.businessArea && formValue.businessArea.length) {
      const areaId = this.appService.getBusinessAreaByFiledValue('name', formValue.businessArea).id;
      if (areaId !== 0) {
        queryParams.push({
          value: [areaId, 0],
          operator: FilterFieldOperator.INCLUDES_ANY,
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
    this.router.navigate([], {relativeTo: this.route, skipLocationChange: false, queryParams: {}});

    if (!this.sortedOffers$) {
      this.getSortedOffers();
    }
  }

  public getTextForMobileFilterButton(): string {
    return this.mobileFilterParamsText;
  }

  public openMobileFilterDialog(): void {
    const filterValues = this.searchForm.getRawValue();
    let data = {};
    if (filterValues[FilterFieldName.OFFER_TYPE] && filterValues[FilterFieldName.OFFER_TYPE].length) {
      data[FilterFieldName.OFFER_TYPE] = filterValues[FilterFieldName.OFFER_TYPE];
    }
    if (filterValues[FilterFieldName.BUSINESS_AREA] && filterValues[FilterFieldName.BUSINESS_AREA].length) {
      data[FilterFieldName.BUSINESS_AREA] = filterValues[FilterFieldName.BUSINESS_AREA];
    }
    if (filterValues[FilterFieldName.CITY] && filterValues[FilterFieldName.CITY].length) {
      data[FilterFieldName.CITY] = filterValues[FilterFieldName.CITY];
    }

    const mobileFilter = this.dialog.open(OffersFilterFormComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, data));
    this.mobileFilterDialogHandler = mobileFilter.afterClosed().subscribe((res) => {
      AppService.unsubscribeHandler([this.mobileFilterDialogHandler]);
      if (!res || !Object.values(res).some(x => (x !== null && x !== ''))) {
        this.clearFilterForm();
        return;
      }

      for (let key in res) {
        this.searchForm.controls[key].setValue(res[key]);
      }
      this.applyFilter();
    });
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
