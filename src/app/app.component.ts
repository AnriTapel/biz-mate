import {Component} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {AuthService} from "./services/auth/auth.service";
import {AppService} from "./services/app/app.service";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private afAuth: AngularFireAuth, private authService: AuthService) {
    this.appInitialAuth();
  }

  async appInitialAuth(): Promise<void> {
    AppService.showOverlay();
    this.afAuth.useDeviceLanguage();
    let userData = await this.afAuth.authState.pipe(first()).toPromise();
    if (userData && !userData.isAnonymous) {
      this.authService.user = {
        displayName: userData.displayName, uid: userData.uid,
        email: userData.email, photoURL: userData.photoURL,
        emailVerified: userData.emailVerified
      };
    } else if (!userData) {
      this.afAuth.signInAnonymously()
        .then(() => this.authService = null)
        .catch((err) => console.error(err))
        .finally(() => AppService.hideOverlay());
    }
    AppService.hideOverlay();
  }
}
