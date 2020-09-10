import {Component} from '@angular/core';
import {NotificationBarService} from "./services/notification-bar/notification-bar.service";
import {OverlayService} from "./services/overlay/overlay.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {
  }

  public isOverlayVisible(): boolean {
    return OverlayService.isOverlayVisible;
  }

  public isNotificationBarVisible(): boolean {
    return NotificationBarService.isVisible;
  }
}
