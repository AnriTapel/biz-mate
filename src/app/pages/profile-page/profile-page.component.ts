import {Component, OnInit} from '@angular/core';
import {User} from "../../models/User";
import {Router} from "@angular/router";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {Offer} from "../../models/Offer";
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable, of} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  user: User = null;
  userOffers$: Observable<Offer[]> = null;

  userDataForm: FormGroup;

  editableFields = {
    displayName: false,
    email: false
  };

  constructor(private appService: AppService, private authService: AuthService, private router: Router,
              private db: AngularFirestore) {
    this.user = this.authService.user;
    this.userDataForm = new FormGroup({
      email: new FormControl(this.user.email || '', [Validators.required]),
      displayName: new FormControl(this.user.displayName || '', [Validators.required])
    });

  }

  ngOnInit(): void {
    this.getUserOffers();
  }

  async getUserOffers(): Promise<void> {
    const userOffersRef = await this.db.collection<Offer[]>('/offers').ref
      .where('userId', '==', this.user.uid).get();

    let offers = [];
    if (userOffersRef.empty)
      return;

    userOffersRef.forEach(it => offers.push(it.data() as Offer));
    offers.sort((a, b) => b.date - a.date);
    this.userOffers$ = of(offers);
  }

  switchEditableField(field: string): void {
    if (this.editableFields[field] && this.userDataForm.get(field).errors)
      return;

    this.editableFields[field] = !this.editableFields[field];
  }

  async editUserData(field: string): Promise<void> {
    if (this.userDataForm.get(field).status == "INVALID")
      return;

    let newValue = this.userDataForm.get(field).value;

    let result: Promise<void>;
    if (field === 'email')
      result = this.authService.updateUserEmail(newValue);
    else
      result = this.authService.updateUserDisplayNameOrPhotoURL(field, newValue);

    result
      .then(() => {
        this.editableFields[field] = false;
        this.updateUserDataInOffers(field, newValue);
      }).catch(() => console.error(`Couldn't edit ${field} field`));
  }

  updateUserDataInOffers(field: string, newValue: string) {
    this.db.collection<Offer[]>('/offers').ref.where('userId', '==', this.user.uid).get()
      .then((resp) => {
        let batch = this.db.firestore.batch();

        resp.docs.forEach(userDocRef => {
          batch.update(userDocRef.ref, {[field]: newValue});
        });

        batch.commit().then(() => this.getUserOffers()).catch(err => console.error(err));
      }).catch(error => console.error(error));
  }

}
