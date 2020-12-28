import {Component} from '@angular/core';
import {UserSubscriptionsService} from "./services/user-subscriptions/user-subscriptions.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private INITIAL_SPINNER_ELEMENT_ID = 'initial_spinner';
  private isInitialRouteActivated: boolean = false;

  constructor(private userSubscriptionsService: UserSubscriptionsService) {
  }

  public onActivate() {
    if (this.isInitialRouteActivated) {
      return;
    }

    document.getElementById(this.INITIAL_SPINNER_ELEMENT_ID).style.display = 'none';
    this.isInitialRouteActivated = true;
  }
}
