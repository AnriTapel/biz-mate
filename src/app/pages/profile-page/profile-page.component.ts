import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {Offer} from "../../models/Offer";
import {Observable} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OverlayService} from "../../services/overlay/overlay.service";
import {StorageService} from "../../services/storage/storage.service";
import {DatabaseService} from "../../services/database/database.service";
import {LazyLoadingService} from "../../services/lazy-loading/lazy-loading.service";

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent extends ComponentBrowserAbstractClass implements OnInit {

  public userOffers$: Observable<Offer[]> = null;
  public userDataForm: FormGroup;
  public editableFields = {
    displayName: false,
    email: false
  };

  private dialogHandler: any = undefined;

  constructor(private appService: AppService, protected authService: AuthService, private router: Router,
              private dialog: MatDialog, private storageService: StorageService, private databaseService: DatabaseService,
              private notificationBarService: NotificationBarService, private seoService: SeoService,
              private lazyLoadingService: LazyLoadingService) {
    super(authService);
    this.metaTags = {title: 'Мой профиль | BizMate'};
    this.userDataForm = new FormGroup({
      email: new FormControl(this.userAuthData.email || '', [Validators.required]),
      displayName: new FormControl(this.userAuthData.displayName || '', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.getUserOffers();
  }

  private getUserOffers(): void {
    try {
      this.userOffers$ = this.databaseService.getUserOffersByUserId(this.userAuthData.uid);
    } catch (e) {
      this.notificationBarService.showNotificationBar(Messages.COULD_NOT_LOAD_USER_OFFERS, false)
    }
  }

  public switchEditableField(field: string): void {
    if (this.editableFields[field] && this.userDataForm.get(field).errors)
      return;

    this.editableFields[field] = !this.editableFields[field];
  }

  public changePhotoURL(): void {
    this.lazyLoadingService.getLazyLoadedComponent(LazyLoadingService.CUSTOM_IMAGE_CROPPER_MODULE_NAME)
      .then(comp => {
        const dialogRef = this.dialog.open(comp, MatDialogConfig.narrowDialogWindow);
        this.dialogHandler = dialogRef.afterClosed().subscribe((res) => {
          AppService.unsubscribeHandler([this.dialogHandler]);
          if (res && typeof res === "string") {
            this.authService.updateUserDisplayNameOrPhotoURL('photoURL', res)
              .then(async () => {
                this.storageService.deleteUserImage(this.userAuthData.photoURL);
                await this.updateUserData('photoURL', res);
              })
              .catch(() => this.notificationBarService.showNotificationBar(Messages.SAVE_ERROR, false))
              .finally(() => OverlayService.hideOverlay());
          }
        });
      }).catch(console.error);
  }

  public async editUserData(field: string): Promise<void> {
    if (!this.userDataForm.get(field).valid) {
      return;
    }

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
    await this.databaseService.updateUserDataInOffers(this.userAuthData.uid, field, newValue);
    this.notificationBarService.showNotificationBar(Messages.SAVE_SUCCESS, true);
  }
}
