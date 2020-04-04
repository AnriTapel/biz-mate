import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {BusinessArea} from "../../models/BusinessArea";
import {City} from "../../models/City";
import {AngularFirestore} from "@angular/fire/firestore";
import {AppService} from "../../app.service";
import {map, startWith} from "rxjs/operators";
import {FilterFunctions} from "../../filter-functions";
import {NewOffer} from "../../models/NewOffer";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  isGridLayout: boolean = true;
  popularOffers$: Observable<NewOffer[]>;
  filteredOffers: any;

  // Панель поиска
  searchForm: FormGroup;
  filteredBusinessAreas$: Observable<BusinessArea[]>;
  filteredCities$: Observable<City[]>;

  constructor(private appService: AppService, private db: AngularFirestore, private router: Router) {
  }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      titleFilter: new FormControl(''),
      businessAreaFilter: new FormControl(''),
      cityFilter: new FormControl('')
    });

    this.filteredCities$ = this.searchForm.controls.cityFilter.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCities(value))
      );

    this.filteredBusinessAreas$ = this.searchForm.controls.businessAreaFilter.valueChanges
      .pipe(
        startWith(''),
        map(value => FilterFunctions._filterCategories(value))
      );

    this.popularOffers$ = this.db.collection<NewOffer>('/offers').valueChanges({idField: 'offer_id'});
  }

  applyFilter(): void {
    const filterValues = this.searchForm.getRawValue();
    const offersRef = this.db.collection('offers').ref;

    this.filteredOffers = offersRef
      .where('title', filterValues.titleFilter !== "" ? '>=' : '<', filterValues.titleFilter)
      .where('business_areas', 'array-contains', AppService.getBusinessAreaByFiledValue('name', filterValues.businessAreaFilter))
      .where('city', filterValues.cityFilter !== "" ? '>=' : '<', AppService.getCityByFiledValue('name', filterValues.cityFilter))
  }

  clearFilterForm(): void {
    this.searchForm.reset();

    Object.keys(this.searchForm.controls).forEach(key => {
      this.searchForm.get(key).setErrors(null);
    });
  }

  getOfferDate(offer: NewOffer): string {
    return AppService.getOfferDate(offer);
  }

  openOfferPage(offer: NewOffer): void {
    this.router.navigateByUrl(`/offer/${offer.offer_id}`);
  }
}
