import {Component} from '@angular/core';
import {UserSubscriptionsService} from "./services/user-subscriptions/user-subscriptions.service";
import NotificationDataModel from "./models/NotificationDataModel";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfigType, MatDialogConfig} from "./dialogs/mat-dialog-config";
import {ActivatedRoute} from "@angular/router";
import {LazyLoadingService} from "./services/lazy-loading/lazy-loading.service";
import {AppService} from "./services/app/app.service";
import {GoogleAnalyticsEvent} from "./events/GoogleAnalyticsEvent";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  static readonly ROUTES_FOR_NOTIFICATION_BUTTON: string[] = ['/offer/', '/offers-page'];

  private readonly resetPasswordEvent: NotificationDataModel = {
    title: 'Пароль изменен',
    mainText: 'Вы успешно сменили пароль к своей учетной записи!',
    extraButton: [{
      route: '/profile',
      buttonText: 'Войти',
      buttonClass: 'button-primary'
    }]
  };

  private readonly emailVerifyEvent: NotificationDataModel = {
    title: 'Электронная почта подтверждена',
    mainText: 'Вы успешно подтвердили свой адрес электронной почты! Теперь Вы можете отредактировать информацию о себе и перейти к созданию своего первого оффера.',
    extraButton: [{
      route: '/new-offer',
      buttonText: 'Разместить оффер',
      buttonClass: 'button-primary'
    }, {
      route: '/profile',
      buttonText: 'Личный кабинет',
      buttonClass: 'button-primary'
    }]
  };

  constructor(private route: ActivatedRoute, private userSubscriptionsService: UserSubscriptionsService, private dialog: MatDialog, private lazyLoadingService: LazyLoadingService) {
    this.manageRouteParams();
    AppService.hideInitialSpinner();
  }

  private manageRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['password_reset'] || params['email_verify']) {
        this.lazyLoadingService.getLazyLoadedComponent(LazyLoadingService.NOTIFICATION_MODULE_NAME)
          .then(comp => {
            this.dialog.open(comp, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG,
              params['password_reset'] ? this.resetPasswordEvent : this.emailVerifyEvent));
            document.dispatchEvent(new GoogleAnalyticsEvent(params['password_reset'] ? 'reset_password' : 'complete_sign_up'));
          }).catch(console.error);
      } else if (params['event']) {
        if (params['event'] === 'unsubscribe') {
          this.userSubscriptionsService.resolveUnsubscribeQuery(params);
        }
      }
    });
  }

  public onNotificationButtonClick(): void {
    this.userSubscriptionsService.showNewOffersSubscriptionDialog();
  }

  public showNotificationButton(): boolean {
    return AppComponent.ROUTES_FOR_NOTIFICATION_BUTTON.filter(it => location.href.indexOf(it) !== -1).length > 0;
  }
}
