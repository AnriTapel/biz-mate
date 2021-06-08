import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Offer} from "../../models/Offer";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {OverlayService} from "../../services/overlay/overlay.service";
import {DatabaseService} from "../../services/database/database.service";
import {AppService} from "../../services/app/app.service";
import {LazyLoadingService} from "../../services/lazy-loading/lazy-loading.service";
import {StorageService} from "../../services/storage/storage.service";

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferCardComponent {

  @Input() offer: Offer;

  public readonly editable: boolean;
  private dialogHandler: any;

  constructor(private router: Router, private dialog: MatDialog, private route: ActivatedRoute, private lazyLoadingService: LazyLoadingService,
              private notificationService: NotificationBarService, private databaseService: DatabaseService, private storageService: StorageService) {
    this.editable = this.router.url == '/profile';
  }

  /*public getOfferDate(offer: Offer): string {
    return AppService.getDateAsString(offer.date);
  }*/

  public editOffer(): void {
    this.router.navigateByUrl(`/edit-offer/${this.offer.offerId}`);
  }

  public getOfferDescription(): string {
    if (this.offer.desc.length < 240) {
      return this.offer.desc;
    }

    const cutDesc = this.offer.desc.substr(0, 245);
    const lastSpaceIndex = cutDesc.lastIndexOf(' ');
    return cutDesc.substring(0, lastSpaceIndex) + '...';
  }

  public onDeleteOfferButtonClick(): void {
    this.lazyLoadingService.getLazyLoadedComponent(LazyLoadingService.DELETE_OFFER_MODULE_NAME).then((comp) => {
      const dialog = this.dialog.open(comp, MatDialogConfig.narrowDialogWindow);
      this.dialogHandler = dialog.afterClosed().subscribe((res) => {
        if (res === true) {
          this.deleteOffer();
        }
        AppService.unsubscribeHandler([this.dialogHandler]);
      });
    }).catch(console.error);
  }

  private deleteOffer(): void {
    OverlayService.showOverlay();
    if (this.offer.imagesURL && this.offer.imagesURL.length) {
      this.offer.imagesURL.forEach(it => this.storageService.deleteUserImage(it));
    }
    this.databaseService.deleteOffer(this.offer)
      .then(() => {
        this.notificationService.showNotificationBar(Messages.DELETE_OFFER_SUCCESS, true);
        //@ts-ignore
        ym(65053642, 'reachGoal', 'offerDeleted');
        document.dispatchEvent(new Event('offerdeleted'));
      })
      .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      .finally(() => OverlayService.hideOverlay());
  }
}
