import {Injectable} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {NotificationBarService} from "../notification-bar/notification-bar.service";
import {DatabaseService} from "../database/database.service";
import {MatDialog} from "@angular/material/dialog";
import {NewOffersSubscriptionComponent} from "../../dialogs/new-offers-subscription/new-offers-subscription.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {UserSubscriptions} from "../../models/UserSubscriptions";
import {Messages} from "../../models/Messages";
import {OverlayService} from "../overlay/overlay.service";

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
    if (this.authService.user && await this.dbService.getUserSubscriptionsByEmail(btoa(this.authService.user.email))) {
      UserSubscriptionsService.setNewOffersSubscriptionStatus(true);
      return;
    }
    this.setNewOffersSubscriptionTimeout();
  }

  public showNewOffersSubscriptionDialog(): void {
    let dialog = this.matDialog.open(NewOffersSubscriptionComponent, this.authService.user
      ? MatDialogConfig.getConfigWithData(DialogConfigType.WIDE_CONFIG, {email: this.authService.user.email})
      : MatDialogConfig.wideDialogWindow);
    dialog.afterClosed().subscribe((res) => {
      if (!res) {
        UserSubscriptionsService.setNewOffersSubscriptionStatus(false);
      } else {
        res.email = btoa(res.email);
        this.dbService.setUserSubscriptionsByEmail(res as UserSubscriptions)
          .then(() => {
            UserSubscriptionsService.setNewOffersSubscriptionStatus(true);
            this.notificationService.showNotificationBar(Messages.SUBSCRIPTION_SUCCESS, true);
            //@ts-ignore
            ym(65053642,'reachGoal','newOffersSubscription')
          })
          .catch(() => this.notificationService.showNotificationBar(Messages.SUBSCRIPTION_ERROR, false));
      }
    });
  }

  private setNewOffersSubscriptionTimeout(): void {
    if (Math.random() > 0.5) {
      setTimeout(this.showNewOffersSubscriptionDialog.bind(this),
        UserSubscriptionsService.NEW_OFFERS_SUBSCRIPTION_DIALOG_TIMEOUT_MSEC);
    }
  }

  public async resolveUnsubscribeQuery(params: any): Promise<void> {
    switch (params['action']) {
      case 'new_offers':
        if (params['user']) {
          try {
            await this.unsubscribeNewOffersByEmail(params['user']);
          } catch (e) {
            console.log(e);
          }
        }
        break;
      default:
        break;
    }
  }

  public async unsubscribeNewOffersByEmail(email: string): Promise<void> {
    OverlayService.showOverlay();
    this.dbService.removeUserSubscriptionByField(email, ['newOfferAreas'])
      .then(() => {
        UserSubscriptionsService.setNewOffersSubscriptionStatus(false);
        this.notificationService.showNotificationBar(Messages.UNSUBSCRIBE_SUCCESS, true);
      })
      .catch(() => this.notificationService.showNotificationBar(Messages.UNSUBSCRIBE_ERROR, false))
      .finally(() => OverlayService.hideOverlay());
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
