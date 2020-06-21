import {Injectable} from '@angular/core';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {User} from "../../models/User";
import {Observable, of} from "rxjs";
import {switchMap} from "rxjs/operators";
import {AppService} from "../app/app.service";
import {MatDialog} from "@angular/material/dialog";
import {EmailVerifyComponent} from "../../dialogs/email-verify-message/email-verify.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import * as firebase from 'firebase/app';
import 'firebase/analytics';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any>;
  user: User;

  constructor(private afAuth: AngularFireAuth, private dialog: MatDialog) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user && !user.isAnonymous) {
          this.user = {
            displayName: user.displayName, uid: user.uid,
            email: user.email, photoURL: user.photoURL,
            emailVerified: user.emailVerified
          };
          if (!this.user.emailVerified) {
            this.openEmailVerificationDialog();
          }
        } else
          this.user = null;
        return of(user);
      }));
  }

  appInitAuth(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.useDeviceLanguage();
      firebase.analytics();
      let handler = this.afAuth.authState.subscribe((userData) => {
        if (userData && !userData.isAnonymous) {
          this.user = {
            displayName: userData.displayName, uid: userData.uid,
            email: userData.email, photoURL: userData.photoURL,
            emailVerified: userData.emailVerified
          };

          resolve();
        } else if (!userData) {
          this.afAuth.auth.signInAnonymously().then(() => {
            this.user = null;
            resolve();
          }).catch((err) => reject(err));
        } else {
          resolve();
        }
        handler.unsubscribe();
      }, (error) => {
        handler.unsubscribe();
        reject(error);
      });
    });
  }

  emailAndPasswordLogin(credentials: any): Promise<void> {
    return new Promise<void>(async(resolve, reject) => {
      try {
        await this.afAuth.auth.signInWithEmailAndPassword(credentials.login, credentials.password);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  emailPasswordSignUp(credentials: any): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
        await this.afAuth.auth.currentUser.updateProfile({
          'displayName': credentials.name,
          'photoURL': AppService.getDefaultAvatar()
        });
        this.updateCurrentUserData();
        await this.sendEmailVerification();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  updateUserEmail(newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.currentUser.updateEmail(newValue)
        .then(() => {
          this.afAuth.auth.currentUser.sendEmailVerification();
          resolve();
        }).catch(() => reject())
    });
  }

  resetPasswordByEmail(email: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.sendPasswordResetEmail(email, {
        url: 'https://biz-mate.ru/?password_reset=true'
      })
        .then((res) => resolve(res))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  updateUserDisplayNameOrPhotoURL(field: string, newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.currentUser.updateProfile({[field]: newValue})
        .then(() => resolve()).catch(() => reject());
    });
  }

  // Update this.user when firebaseUser data is changed
  updateCurrentUserData(): User {
    const user = this.afAuth.auth.currentUser;
    if (user)
      this.user = {
        displayName: user.displayName,
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      };
    else
      this.user = null;

    return this.user;
  }

  googleAuth(): Promise<void> {
    return new Promise<void>(async(resolve, reject) => {
      try {
        const provider = new auth.GoogleAuthProvider();
        await this.afAuth.auth.signInWithPopup(provider);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  public async sendEmailVerification(): Promise<void> {
    await this.afAuth.auth.currentUser.sendEmailVerification({
      url: 'https://biz-mate.ru/profile?email_verify=true'
    });
  }

  private openEmailVerificationDialog(): void {
    this.dialog.open(EmailVerifyComponent,
      MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {email: this.user.email, alreadySent: false}));
  }

  signOut() {
    this.user = null;
    return this.afAuth.auth.signOut().then(() => {
      this.afAuth.auth.signInAnonymously();
    });
  }
}
