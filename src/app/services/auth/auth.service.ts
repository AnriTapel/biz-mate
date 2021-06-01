import {Injectable} from '@angular/core';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {User} from "../../models/User";
import {AppService} from "../app/app.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import AppEventNames from "../../events/AppEventNames";
import {LazyLoadingService} from "../lazy-loading/lazy-loading.service";
import {ErrorsService} from "../errors/errors.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static readonly EMAIL_VERIFICATION_DIALOG_TIMEOUT_SEC: number = 5;

  public user: User = undefined;
  private firstUserSession: boolean = undefined;

  //TODO: make user private and create getter for other classes
  constructor(private afAuth: AngularFireAuth, private dialog: MatDialog, private lazyLoadingService: LazyLoadingService) {
    document.addEventListener(AppEventNames.AUTH_STATE_REQUEST, this.dispatchAuthStateResponse.bind(this));
  }

  public async appInitAuth(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.afAuth.useDeviceLanguage();
        this.observeAuthState()
          .then(resolve)
          .catch((e) => reject(e));
      } catch (e) {
        reject(e);
      }
    });

  }

  private observeAuthState(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.onAuthStateChanged(async (user) => {
        if (user && user.isAnonymous === false) {
          this.user = {
            displayName: user.displayName, uid: user.uid,
            email: user.email, photoURL: user.photoURL,
            emailVerified: user.emailVerified
          };
          if (!this.user.emailVerified && !this.firstUserSession) {
            setTimeout(this.openEmailVerificationDialog.bind(this),
              AuthService.EMAIL_VERIFICATION_DIALOG_TIMEOUT_SEC * 1000);
          }
          resolve();
        } else if (user && user.isAnonymous === true) {
          this.user = null;
          resolve();
        } else {
          try {
            await this.signInAnonymously();
            resolve();
          } catch (e) {
            ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.observeAuthState signInAnonymously', error: e});
            reject(e);
            return;
          }
        }
        this.dispatchAuthStateResponse();
      }, (err) => {
        ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.observeAuthState', error: err});
        reject(err);
      });
    });
  }

  private dispatchAuthStateResponse(): void {
    document.dispatchEvent(new CustomEvent(AppEventNames.AUTH_STATE_RESPONSE, {detail: this.user}));
  }

  private dispatchAuthStateChange(): void {
    document.dispatchEvent(new CustomEvent(AppEventNames.AUTH_STATE_CHANGED, {detail: this.user}));
  }

  private async signInAnonymously(): Promise<void> {
    await this.afAuth.signInAnonymously();
    this.user = null;
  }

  public emailAndPasswordLogin(credentials: any): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.afAuth.signInWithEmailAndPassword(credentials.login, credentials.password);
        resolve();
      } catch (e) {
        ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.emailAndPasswordLogin', error: e});
        reject(e);
      }
    });
  }

  public async emailPasswordSignUp(credentials: any): Promise<void> {
    try {
      // This param is used to avoid showing unnecessary "Confirm email" dialog after user signed up and authState changed
      this.firstUserSession = true;
      await this.afAuth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      const userData = await this.afAuth.currentUser;
      await userData.updateProfile({
        displayName: credentials.name,
        photoURL: AppService.getDefaultAvatar()
      });
      this.updateCurrentUserData();
      this.sendEmailVerification();
    } catch (e) {
      this.firstUserSession = undefined;
      this.signOut();
      ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.emailPasswordSignUp', error: e});
    }
  }

  public updateUserEmail(newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.currentUser.then((user) => {
        user.updateEmail(newValue).then(() => {
          user.sendEmailVerification();
          this.updateCurrentUserData();
          resolve();
        }).catch((e) => {
          ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.updateUserEmail', error: e});
          reject();
        });
      });
    });
  }

  public resetPasswordByEmail(email: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.sendPasswordResetEmail(email, {
        url: 'https://biz-mate.ru/?password_reset=true'
      })
        .then((res) => resolve(res))
        .catch((e) => {
          ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.resetPasswordByEmail', error: e});
          reject(e);
        });
    });
  }

  public updateUserDisplayNameOrPhotoURL(field: string, newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.currentUser.then(user => {
        user.updateProfile({[field]: newValue})
          .then(() => {
            this.updateCurrentUserData();
            resolve();
          })
          .catch((e) => {
            ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {
              anchor: 'AuthService.updateUserDisplayNameOrPhotoURL',
              error: e
            });
            reject(e);
          });
      });
    });
  }

  // Update this.user when firebaseUser data is changed
  public async updateCurrentUserData(): Promise<User> {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.user = {
        displayName: user.displayName,
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      };
    } else {
      this.user = null;
    }
    this.dispatchAuthStateChange();
    return this.user;
  }

  public googleAuth(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const provider = new auth.GoogleAuthProvider();
        await this.afAuth.signInWithPopup(provider);
        resolve();
      } catch (e) {
        ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.googleAuth', error: e});
        reject(e);
      }
    });
  }

  public sendEmailVerification(): void {
    this.afAuth.currentUser.then((user) => {
      user.sendEmailVerification({
        url: 'https://biz-mate.ru/?email_verify=true'
      });
    });
  }

  private openEmailVerificationDialog(): void {
    this.lazyLoadingService.getLazyLoadedComponent(LazyLoadingService.EMAIL_VERIFY_MESSAGE_MODULE_NAME)
      .then((comp) =>
        this.dialog.open(comp, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {
          email: this.user.email,
          alreadySent: false
        }))
      ).catch(console.error);
  }

  public async signOut(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (e) {
      ErrorsService.dispatchEvent(AppEventNames.APP_ERROR, {anchor: 'AuthService.signOut', error: e});
    }
  }
}
