import {Component} from '@angular/core';
import {UserSubscriptionsService} from "./services/user-subscriptions/user-subscriptions.service";
import NotificationDataModel from "./models/NotificationDataModel";
import {MatDialog} from "@angular/material/dialog";
import {NotificationComponent} from "./dialogs/notification/notification.component";
import {DialogConfigType, MatDialogConfig} from "./dialogs/mat-dialog-config";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  static readonly ROUTES_FOR_NOTIFICATION_BUTTON: string[] = ['/offer/', '/offers-page'];
  private INITIAL_SPINNER_ELEMENT_ID = 'initial_spinner';
  private isInitialRouteActivated: boolean = false;

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
      buttonText: 'Создать оффер',
      buttonClass: 'button-primary'
    }, {
      route: '/profile',
      buttonText: 'Личный кабинет',
      buttonClass: 'button-primary'
    }]
  };

  constructor(private route: ActivatedRoute, private userSubscriptionsService: UserSubscriptionsService, private dialog: MatDialog) {
    this.route.queryParams.subscribe(params => {
      this.onRouteActivated();
      if (params['password_reset']) {
        this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.resetPasswordEvent));
        //@ts-ignore
        ym(65053642, 'reachGoal', 'resetPassword')
      } else if (params['email_verify']) {
        this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.emailVerifyEvent));
        //@ts-ignore
        ym(65053642, 'reachGoal', 'completeSignUp');
      } else if (params['event']) {
        if (params['event'] === 'unsubscribe') {
          this.userSubscriptionsService.resolveUnsubscribeQuery(params);
        }
      }
    });
  }

  public onRouteActivated(): void {
    if (this.isInitialRouteActivated) {
      return;
    }

    document.getElementById(this.INITIAL_SPINNER_ELEMENT_ID).style.display = 'none';
    this.isInitialRouteActivated = true;
  }

  public onNotificationButtonClick(): void {
    this.userSubscriptionsService.showNewOffersSubscriptionDialog();
  }

  public showNotificationButton(): boolean {
    return AppComponent.ROUTES_FOR_NOTIFICATION_BUTTON.filter(it => location.href.indexOf(it) !== -1).length > 0;
  }
}
