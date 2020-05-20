import {Component} from '@angular/core';
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";

@Component({
  selector: 'app-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrls: ['./notification-bar.component.scss']
})
export class NotificationBarComponent {

  constructor(private notificationBarService: NotificationBarService) { }

  hideNotificationBar(): void {
    this.notificationBarService.hideNotificationBar();
  }

  getNotificationText(): string {
    return this.notificationBarService.message;
  }

  isBarVisible(): boolean {
    return this.notificationBarService.isVisible;
  }

  getMessageStatus(): boolean {
    return this.notificationBarService.isSuccess;
  }

}
