import {Component} from '@angular/core';
import {NotificationBarService} from "../../services/notification-bar/notification-bar.service";

@Component({
  selector: 'app-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrls: ['./notification-bar.component.scss']
})
export class NotificationBarComponent {

  constructor(private notificationBarService: NotificationBarService) { }

  public getNotificationText(): string {
    return this.notificationBarService.message;
  }

  public isBarVisible(): boolean {
    return NotificationBarService.isVisible;
  }

  public getMessageStatus(): boolean {
    return this.notificationBarService.isSuccess;
  }

}
