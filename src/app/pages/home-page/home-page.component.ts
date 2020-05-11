import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {of, Observable, zip} from "rxjs";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {AngularFirestore} from "@angular/fire/firestore";
import {AppService} from "../../services/app/app.service";
import {map, startWith} from "rxjs/operators";
import {Offer} from "../../models/Offer";
import * as _ from 'lodash';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  private readonly OFFER_QUERY_LIMIT: number = 2;
  private lastVisibleOffer: any = null;

  isGridLayout: boolean = true;
  popularOffers$: Observable<any[]>;
  filteredOffers$: Observable<Offer[]>;

  // Панель поиска
  searchForm: FormGroup;
  filteredBusinessArea$: Observable<BusinessArea[]>;
  filteredCities$: Observable<City[]>;

  constructor(private appService: AppService, private db: AngularFirestore) {
  }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      titleFilter: new FormControl(null),
      businessAreaFilter: new FormControl(null, [AppService.businessAreaFieldValidator()]),
      cityFilter: new FormControl(null, [AppService.cityFieldValidator()])
    });

    this.filteredCities$ = this.searchForm.controls.cityFilter.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterCities(value))
      );

    this.filteredBusinessArea$ = this.searchForm.controls.businessAreaFilter.valueChanges
      .pipe(
        startWith(''),
        map(value => AppService._filterCategories(value))
      );

    this.getInitialOffers();
  }

  async getInitialOffers(): Promise<void> {
    let initialQuery = await this.db.collection<Offer>('/offers').ref
        .orderBy('date', 'desc').limit(this.OFFER_QUERY_LIMIT).get();

    let offers = [];

    if (!initialQuery.empty) {
      initialQuery.forEach(it => offers.push(it.data()));
      this.lastVisibleOffer = initialQuery.docs[initialQuery.docs.length - 1];

      this.popularOffers$ = of(offers);
    }
  }

  async applyFilter(): Promise<void> {
    if (this.searchForm.status === 'INVALID')
      return;

    let filterResults = {
      titleFiltered: [],
      areaFiltered: [],
      cityFiltered: []
    };

    try {
      const filterValues = this.searchForm.getRawValue();
      const offersRef = this.db.collection('offers').ref;

      if (filterValues.titleFilter && filterValues.titleFilter !== "") {
        let titleRes = await offersRef.where('title', '>=', filterValues.titleFilter).get();

        if (!titleRes.empty)
          titleRes.forEach(it => filterResults.titleFiltered.push(it.data()))
      }

      if (filterValues.businessAreaFilter && filterValues.businessAreaFilter !== "") {
        let areaRes = await offersRef
          .where('businessArea', 'array-contains', AppService.getBusinessAreaByFiledValue('name', filterValues.businessAreaFilter).id).get();

        if (!areaRes.empty) {
          areaRes.forEach(it => filterResults.areaFiltered.push(it.data()))
        }
      }

      if (filterValues.cityFilter && filterValues.cityFilter !== "") {
        let cityRes = await offersRef
          .where('city', '>=', AppService.getCityByFiledValue('name', filterValues.cityFilter).id).get();

        if (!cityRes.empty)
          cityRes.forEach(it => filterResults.cityFiltered.push(it.data()))
      }

      if (!filterResults.cityFiltered.length && !filterResults.areaFiltered.length && !filterResults.titleFiltered)
        return;

      this.filteredOffers$ = of(_.union<Offer>(filterResults.titleFiltered, filterResults.areaFiltered, filterResults.cityFiltered)
        .sort((a,b) => b.date - a.date));
    } catch (e) {
      console.error(e);
      this.filteredOffers$ = null;
    }
  }

  clearFilterForm(): void {
    this.searchForm.reset();

    Object.keys(this.searchForm.controls).forEach(key => {
      this.searchForm.get(key).setErrors(null);
    });

    this.filteredOffers$ = null;
  }

  async loadNextOffersChunk(): Promise<void> {
    let query = await this.db.collection<Offer>('/offers').ref
      .orderBy('date', 'desc').limit(this.OFFER_QUERY_LIMIT).startAfter(this.lastVisibleOffer).get();

    let offers = [];

    if (!query.empty) {
      query.forEach(it => offers.push(it.data()));
      this.lastVisibleOffer = query.docs[query.docs.length - 1];

      this.popularOffers$ = zip(this.popularOffers$, of(offers))
        .pipe(map(x => x[0].concat(x[1])))
    }
  }
}
