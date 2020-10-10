import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Offer} from "../../models/Offer";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {DeleteOfferComponent} from "../../dialogs/delete-offer/delete-offer.component";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {AngularFirestore} from "@angular/fire/firestore";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {OverlayService} from "../../services/overlay/overlay.service";
import {StorageService} from "../../services/storage/storage.service";

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferCardComponent implements OnInit {

  @Input() offer: Offer;
  @Input() editable: boolean;

  constructor(private auth: AuthService, private router: Router, private dialog: MatDialog, private route: ActivatedRoute,
              private db: AngularFirestore, private notificationService: NotificationBarService, private storageService: StorageService) { }

  ngOnInit(): void {
  }

  public getOfferDate(offer: Offer): string {
    return AppService.getOfferDate(offer);
  }

  public editOffer(): void {
    this.router.navigateByUrl(`/edit-offer/${this.offer.offerId}`);
  }

  public getOfferDescription(): string {
    if (this.offer.desc.length < 240) {
      return this.offer.desc;
    }

    let cutDesc = this.offer.desc.substr(0, 245);
    let lastSpaceIndex = cutDesc.lastIndexOf(' ');
    return cutDesc.substring(0, lastSpaceIndex) + '...';
  }

  public onDeleteOfferButtonClick(): void {
    let dialog = this.dialog.open(DeleteOfferComponent, MatDialogConfig.narrowDialogWindow);
    dialog.afterClosed().subscribe((res) => {
      if (res === true) {
        this.deleteOffer();
      }
    })
  }

  private async deleteOffer(): Promise<void> {
    OverlayService.showOverlay();
    let offerRef = await this.db.collection('/offers').doc(this.offer.offerId).ref.get();
    let offer = offerRef.data() as Offer;

    if (offer.imagesURL && offer.imagesURL.length) {
      for (let img of offer.imagesURL) {
        this.storageService.deleteUserImage(img);
      }
    }

    this.db.collection('/offers').doc(this.offer.offerId).delete()
      .then(() => {
        this.notificationService.showNotificationBar(Messages.DELETE_OFFER_SUCCESS, true);
        //@ts-ignore
        ym(65053642,'reachGoal','offerDeleted');
      })
      .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      .finally(() => OverlayService.hideOverlay());
  }
}
