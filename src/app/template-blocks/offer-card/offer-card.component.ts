import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Offer} from "../../models/Offer";
import {AppService} from "../../services/app/app.service";
import {AuthService} from "../../services/auth/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {DeleteOfferComponent} from "../../dialogs/delete-offer/delete-offer.component";
import {MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";
import {Messages} from "../../models/Messages";
import {OverlayService} from "../../services/overlay/overlay.service";
import {DatabaseService} from "../../services/database/database.service";

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferCardComponent {

  @Input() offer: Offer;
  @Input() editable: boolean;

  constructor(private auth: AuthService, private router: Router, private dialog: MatDialog, private route: ActivatedRoute,
              private notificationService: NotificationBarService, private databaseService: DatabaseService) {
  }

  public getOfferDate(offer: Offer): string {
    return AppService.getDateAsString(offer.date);
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

  private deleteOffer(): void {
    OverlayService.showOverlay();
    this.databaseService.deleteOffer(this.offer)
      .then(() => {
        this.notificationService.showNotificationBar(Messages.DELETE_OFFER_SUCCESS, true);
        //@ts-ignore
        ym(65053642, 'reachGoal', 'offerDeleted');
      })
      .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      .finally(() => OverlayService.hideOverlay());
  }
}
