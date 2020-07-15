import {Component} from '@angular/core';
import {AuthService} from "./services/auth/auth.service";
import {AppService} from "./services/app/app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private auth: AuthService) {
    AppService.showOverlay();
    this.auth.appInitAuth()
      .finally(() => AppService.hideOverlay())
  }
}
