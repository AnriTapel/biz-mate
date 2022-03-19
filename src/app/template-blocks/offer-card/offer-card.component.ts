import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Offer} from "../../models/Offer";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialogConfig} from "../../dialogs/MatDialogConfig";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {OverlayService} from "../../services/overlay/overlay.service";
import {DatabaseService} from "../../services/database/database.service";
import {StorageService} from "../../services/storage/storage.service";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";
import {EventObserver} from "../../services/event-observer/event-observer.service";
import {DialogModuleNames} from "../../dialogs/DialogModuleNames";
import {OpenDialogEvent} from "../../events/OpenDialogEvent";

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferCardComponent {

  @Input() offer: Offer;

  public readonly editable: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private notificationService: NotificationBarService, private databaseService: DatabaseService,
              private storageService: StorageService, private eventObserver: EventObserver) {
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
    const beforeCloseFunc = (res) => {
      if (res === true) {
        this.deleteOffer();
      }
    };

    this.eventObserver.dispatchEvent(new OpenDialogEvent(DialogModuleNames.DELETE_OFFER_MODULE_NAME, MatDialogConfig.narrowDialogWindow, beforeCloseFunc.bind(this)));
  }

  private deleteOffer(): void {
    OverlayService.showOverlay();
    if (this.offer.imagesURL && this.offer.imagesURL.length) {
      this.offer.imagesURL.forEach(it => this.storageService.deleteUserImage(it));
    }
    this.databaseService.deleteOffer(this.offer)
      .then(() => {
        this.notificationService.showNotificationBar(Messages.DELETE_OFFER_SUCCESS, true);
        this.eventObserver.dispatchEvent(new GoogleAnalyticsEvent('offer_deleted'));
      })
      .catch(() => {
        this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false)
      })
      .finally(() => OverlayService.hideOverlay());
  }
}
