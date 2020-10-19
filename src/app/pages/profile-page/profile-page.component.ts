import {Component, OnInit} from '@angular/core';
import {User} from "../../models/User";
import {Router} from "@angular/router";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {Offer} from "../../models/Offer";
import {Observable} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {CustomImageCropperComponent} from "../../template-blocks/image-cropper/custom-image-cropper.component";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OverlayService} from "../../services/overlay/overlay.service";
import {StorageService} from "../../services/storage/storage.service";
import {DatabaseService} from "../../services/database/database.service";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent extends ComponentBrowserAbstractClass implements OnInit {

  public user: User = null;
  public userOffers$: Observable<Offer[]> = null;
  public hasOffers: boolean = true;

  public userDataForm: FormGroup;

  public editableFields = {
    displayName: false,
    email: false
  };

  constructor(private appService: AppService, private authService: AuthService, private router: Router,
              private dialog: MatDialog, private storageService: StorageService, private databaseService: DatabaseService,
              private notificationBarService: NotificationBarService, private seoService: SeoService) {
    super();
    this.user = this.authService.user;
    this.userDataForm = new FormGroup({
      email: new FormControl(this.user.email || '', [Validators.required]),
      displayName: new FormControl(this.user.displayName || '', [Validators.required])
    });

  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData({title: 'Мой профиль | BizMate'});
    this.getUserOffers();
  }

  private getUserOffers(): void {
    this.databaseService.getUserOffersByUserId(this.user.uid)
      .then((res) => {
        this.hasOffers = !!res;
        this.userOffers$ = res;
      }).catch(() => this.notificationBarService.showNotificationBar(Messages.COULD_NOT_LOAD_USER_OFFERS, false))
  }

  public switchEditableField(field: string): void {
    if (this.editableFields[field] && this.userDataForm.get(field).errors)
      return;

    this.editableFields[field] = !this.editableFields[field];
  }

  public changePhotoURL(): void {
    const dialogRef = this.dialog.open(CustomImageCropperComponent, MatDialogConfig.narrowDialogWindow);
    dialogRef.afterClosed().subscribe((res) => {
      if (res && typeof res === "string") {
        this.authService.updateUserDisplayNameOrPhotoURL('photoURL', res)
          .then(() => {
            this.storageService.deleteUserImage(this.user.photoURL);
            this.updateUserData('photoURL', res);
          })
          .catch(() => this.notificationBarService.showNotificationBar(Messages.SAVE_ERROR, false))
          .finally(() => OverlayService.hideOverlay());
      }
    });
  }

  public async editUserData(field: string): Promise<void> {
    if (this.userDataForm.get(field).status == "INVALID")
      return;

    OverlayService.showOverlay();
    let newValue = this.userDataForm.get(field).value;

    let result: Promise<void>;
    if (field === 'email')
      result = this.authService.updateUserEmail(newValue);
    else
      result = this.authService.updateUserDisplayNameOrPhotoURL(field, newValue);

    result
      .then(() => {
        this.editableFields[field] = false;
        this.updateUserData(field, newValue);
      })
      .catch(() => this.notificationBarService.showNotificationBar(Messages.SAVE_ERROR, false))
      .finally(() => OverlayService.hideOverlay());
  }

  private async updateUserData(field, newValue): Promise<void> {
    await this.databaseService.updateUserDataInOffers(this.user.uid, field, newValue);
    this.getUserOffers();
    this.authService.updateCurrentUserData().then((user) => {
      this.user = user;
    });
    this.notificationBarService.showNotificationBar(Messages.SAVE_SUCCESS, true);
  }
}
