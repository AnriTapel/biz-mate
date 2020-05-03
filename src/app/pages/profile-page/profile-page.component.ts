import {Component, OnInit} from '@angular/core';
import {User} from "../../models/User";
import {Router} from "@angular/router";
import {AppService} from "../../app.service";
import {AuthService} from "../../services/auth/auth.service";
import {Offer} from "../../models/Offer";
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable, of} from "rxjs";
import {City} from "../../models/City";
import {map, startWith} from "rxjs/operators";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  user: User = null;
  userOffers$: Observable<Offer[]> = null;
  filteredCities$: Observable<City[]>;

  userDataForm: FormGroup;

  editableFields = {
    city: false,
    displayName: false,
    phone: false,
    email: false
  };

  constructor(private appService: AppService, private authService: AuthService, private router: Router,
              private db: AngularFirestore) {
    if (!authService.user) {
      router.navigateByUrl('/');
      return;
    }

    this.user = this.authService.user;
    this.userDataForm = new FormGroup({
      city: new FormControl(this.getUserCity(), [Validators.required, AppService.cityFieldValidator()]),
      phone: new FormControl(this.user.phone || '', [Validators.required]),
      email: new FormControl(this.user.email || '', [Validators.required]),
      displayName: new FormControl(this.user.displayName || '', [Validators.required])
    });

    this.filteredCities$ = this.userDataForm.controls.city.valueChanges.pipe(
      startWith(''),
      map(value => AppService._filterCities(value))
    );
  }

  async ngOnInit(): Promise<void> {
    const userOffersRef = await this.db.collection<Offer[]>('/offers').ref
      .where('userId', '==', this.user.uid).get();

    let offers = [];
    if (userOffersRef.empty)
      return;

    userOffersRef.forEach(it => offers.push(it.data() as Offer));
    offers.sort((a,b) => b.date - a.date);
    this.userOffers$ = of(offers);
  }

  getUserCity(): string {
    const city: City = AppService.getCityByFiledValue('id', this.user.city);
    return city ? city.name : '';
  }

  switchEditableField(field: string): void {
    if (this.editableFields[field] && this.userDataForm.get(field).errors)
      return;

    this.editableFields[field] = !this.editableFields[field];
  }

  editUserData(field: string): void {
    if (this.userDataForm.get(field).status == "INVALID")
      return;

    let newValue = this.userDataForm.get(field).value;

    this.db.collection('users').doc(this.user.uid).update({
      [field]: newValue
    }).then(() => {
      this.user[field] = newValue;
      console.log('OK');
      this.editableFields[field] = false;
    }).catch((e) => {
      console.log(e);
    });
  }

  editUserCityField(event): void {
    const value = event.source.value;
    const cityId = AppService.getCityByFiledValue('name', value).id;

    this.userDataForm.controls.city.setValue(value);

    this.db.collection('users').doc(this.user.uid).update({
      'city': cityId
    }).then(() => {
      this.user.city = cityId;
      this.editableFields.city = false;
    }).catch((e) => {
      console.log(e);
    });
  }

}
