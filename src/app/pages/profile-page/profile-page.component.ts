import {Component, OnInit} from '@angular/core';
import {User} from "../../models/User";
import {ActivatedRoute, Router} from "@angular/router";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {Offer} from "../../models/Offer";
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable, of} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {CustomImageCropperComponent} from "../../template-blocks/image-cropper/custom-image-cropper.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {NotificationComponent} from "../../dialogs/notification/notification.component";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  readonly emailVerifyEvent = {
    title: 'Электронная почта подтверждена',
    text: 'Вы успешно подтвердили свой адрес электронной почты! Теперь Вы можете отредактировать информацию о себе и перейти к созданию своего первого оффера.'
  };

  readonly resetPasswordEvent = {
    title: 'Пароль изменен',
    text: 'Вы успешно сменили пароль к своей учетной записи!'
  };

  user: User = null;
  userOffers$: Observable<Offer[]> = null;

  userDataForm: FormGroup;

  editableFields = {
    displayName: false,
    email: false
  };

  constructor(private appService: AppService, private authService: AuthService, private router: Router,
              private db: AngularFirestore, private dialog: MatDialog, private route: ActivatedRoute,
              private notificationBarService: NotificationBarService) {

    this.route.queryParams.subscribe(params => {
      if (params['email_verify']) {
        this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.emailVerifyEvent))
      } else if (params['password_reset']) {
        this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.resetPasswordEvent))
      }
    });

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

  async changePhotoURL(): Promise<void> {
    const dialogRef = this.dialog.open(CustomImageCropperComponent, MatDialogConfig.narrowDialogWindow);
    dialogRef.afterClosed().subscribe((res) => {
      if (res && typeof res === "string") {

        this.authService.updateUserDisplayNameOrPhotoURL('photoURL', res)
          .then(() => {
            this.updateUserDataInOffers('photoURL', res);
            this.user = this.authService.updateCurrentUserData();
            this.notificationBarService.showNotificationBar(Messages.SAVE_SUCCESS, true);
          })
          .catch(() => this.notificationBarService.showNotificationBar(Messages.SAVE_ERROR, false));
      }
    });
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
        this.user = this.authService.updateCurrentUserData();
        this.notificationBarService.showNotificationBar(Messages.SAVE_SUCCESS, true);
      }).catch(() => this.notificationBarService.showNotificationBar(Messages.SAVE_ERROR, false));
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
