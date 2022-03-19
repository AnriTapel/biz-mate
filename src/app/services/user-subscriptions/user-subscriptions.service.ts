import {Injectable} from '@angular/core';
import {NotificationBarService} from "../notification-bar/notification-bar.service";
import {DatabaseService} from "../database/database.service";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/MatDialogConfig";
import {UserSubscriptions} from "../../models/UserSubscriptions";
import {Messages} from "../../models/Messages";
import {OverlayService} from "../overlay/overlay.service";
import {AppService} from "../app/app.service";
import {BizMateUser} from "../../models/BizMateUser";
import {AuthService} from "../auth/auth.service";
import {GoogleAnalyticsEvent} from "../../events/GoogleAnalyticsEvent";
import {EventObserver} from "../event-observer/event-observer.service";
import {DialogModuleNames} from "../../dialogs/DialogModuleNames";
import {OpenDialogEvent} from "../../events/OpenDialogEvent";

@Injectable({
  providedIn: 'root'
})
export class UserSubscriptionsService {

  private userData: BizMateUser = undefined;

  static readonly NEW_OFFERS_SUBSCRIPTION_STORAGE_FIELD_NAME: string = 'bm_new_offers_subscription_status';
  static readonly NEW_OFFERS_SUBSCRIPTION_DIALOG_TIMEOUT_MSEC: number = 5000;

  constructor(private notificationService: NotificationBarService, private dbService: DatabaseService, private eventObserver: EventObserver, private authService: AuthService) {
    this.initService();
  }

  private async initService(): Promise<void> {
    this.userData = this.authService.credentials;
    const newOffersSubStatus = UserSubscriptionsService.getNewOffersSubscriptionStatus();
    if (newOffersSubStatus === true) {
      return;
    } else if (newOffersSubStatus === false) {
      this.setNewOffersSubscriptionTimeout();
      return;
    }
    if (this.userData.email) {
      const userSubscriptionData = await this.dbService.getUserSubscriptionsByEmail(btoa(this.userData.email));
      if (userSubscriptionData) {
        UserSubscriptionsService.setNewOffersSubscriptionStatus(true);
        return;
      }
    }
    this.setNewOffersSubscriptionTimeout();
  }

  public showNewOffersSubscriptionDialog(): void {
    const config = this.userData.email
      ? MatDialogConfig.getConfigWithData(DialogConfigType.WIDE_CONFIG, {email: this.userData.email})
      : MatDialogConfig.wideDialogWindow;
    const beforeCloseFunc = (res) => {
      if (!res && !this.userData.isAnonymous) {
        UserSubscriptionsService.setNewOffersSubscriptionStatus(false);
      } else if (res) {
        res.email = btoa(res.email);
        this.dbService.setUserSubscriptionsByEmail(res as UserSubscriptions)
          .then(() => {
            UserSubscriptionsService.setNewOffersSubscriptionStatus(true);
            this.notificationService.showNotificationBar(Messages.SUBSCRIPTION_SUCCESS, true);
            this.eventObserver.dispatchEvent(new GoogleAnalyticsEvent('new_offers_subscription'))
          })
          .catch(() => this.notificationService.showNotificationBar(Messages.SUBSCRIPTION_ERROR, false));
      }
    };

    this.eventObserver.dispatchEvent(new OpenDialogEvent(DialogModuleNames.NEW_OFFERS_SUBSCRIPTION_MODULE_NAME, config, beforeCloseFunc.bind(this)));
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

  private static getNewOffersSubscriptionStatus(): boolean {
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
