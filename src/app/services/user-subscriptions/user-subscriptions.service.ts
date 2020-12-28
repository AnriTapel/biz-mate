import {Injectable} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {NotificationBarService} from "../notification-bar/notification-bar.service";
import {DatabaseService} from "../database/database.service";
import {MatDialog} from "@angular/material/dialog";
import {NewOffersSubscriptionComponent} from "../../dialogs/new-offers-subscription/new-offers-subscription.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {UserSubscriptions} from "../../models/UserSubscriptions";

@Injectable({
  providedIn: 'root'
})
export class UserSubscriptionsService {

  static readonly NEW_OFFERS_SUBSCRIPTION_STORAGE_FIELD_NAME: string = 'bm_new_offers_subscription_status';
  static readonly NEW_OFFERS_SUBSCRIPTION_DIALOG_TIMEOUT_MSEC: number = 5000;

  constructor(private authService: AuthService, private notificationService: NotificationBarService,
              private dbService: DatabaseService, private matDialog: MatDialog) {

    this.initService();
  }

  private async initService(): Promise<void> {
    let newOffersSubStatus = UserSubscriptionsService.getNewOffersSubscriptionStatus();
    if (newOffersSubStatus) {
      return;
    } else if (newOffersSubStatus === false) {
      this.setNewOffersSubscriptionTimeout();
      return;
    }
    if (this.authService.user && await this.dbService.getUserSubscriptionsByEmail(this.authService.user.email)) {
      UserSubscriptionsService.setNewOffersSubscriptionStatus(true);
      return;
    }
    this.setNewOffersSubscriptionTimeout();
  }

  private setNewOffersSubscriptionTimeout(): void {
    setTimeout(() => {
      let dialog = this.matDialog.open(NewOffersSubscriptionComponent, this.authService.user
        ? MatDialogConfig.getConfigWithData(DialogConfigType.WIDE_CONFIG, {email: this.authService.user.email})
        : MatDialogConfig.wideDialogWindow);
      dialog.afterClosed().subscribe((res) => {
        if (!res) {
          UserSubscriptionsService.setNewOffersSubscriptionStatus(false);
        } else {
          this.dbService.setUserSubscriptionsByEmail(res as UserSubscriptions)
            .then(() => UserSubscriptionsService.setNewOffersSubscriptionStatus(true))
            .catch(console.log);
        }
      });
    }, UserSubscriptionsService.NEW_OFFERS_SUBSCRIPTION_DIALOG_TIMEOUT_MSEC)
  }

  public static getNewOffersSubscriptionStatus(): boolean {
    const status = localStorage.getItem(UserSubscriptionsService.NEW_OFFERS_SUBSCRIPTION_STORAGE_FIELD_NAME);
    if (status === null) {
      return null;
    }
    return status === '1';
  }

  public static setNewOffersSubscriptionStatus(status: boolean): void {
    localStorage.setItem(UserSubscriptionsService.NEW_OFFERS_SUBSCRIPTION_STORAGE_FIELD_NAME, status ? '1' : '0');
  }
}
