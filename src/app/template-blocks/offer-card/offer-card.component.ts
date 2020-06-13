import {Component, Input, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss']
})
export class OfferCardComponent implements OnInit {

  @Input() offer: Offer;
  @Input() editable: boolean;

  constructor(private auth: AuthService, private router: Router, private dialog: MatDialog, private route: ActivatedRoute,
              private db: AngularFirestore, private notificationService: NotificationBarService) { }

  ngOnInit(): void {
  }

  getOfferDate(offer: Offer): string {
    return AppService.getOfferDate(offer);
  }

  openOfferPage(offer: Offer): void {
    window.open(`/offer/${offer.offerId}`, '_blank');
  }

  editOffer(): void {
    this.router.navigateByUrl(`/edit-offer/${this.offer.offerId}`);
  }

  deleteOffer(): void {
    let dialog = this.dialog.open(DeleteOfferComponent, MatDialogConfig.narrowDialogWindow);
    dialog.afterClosed().subscribe((res) => {
      if (res === true) {
        this.db.collection('/offers').doc(this.offer.offerId).delete()
          .then(() => this.notificationService.showNotificationBar(Messages.DELETE_OFFER_SUCCESS, true))
          .catch(() => this.notificationService.showNotificationBar(Messages.DEFAULT_MESSAGE, false))
      }
    })
  }

}
