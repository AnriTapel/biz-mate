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
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static readonly EMAIL_VERIFICATION_DIALOG_TIMEOUT_SEC: number = 5;

  private _credentials: BehaviorSubject<User> = new BehaviorSubject<User>({isAnonymous: true, uid: null});
  private firstUserSession: boolean = undefined;
  private initialAuthCompleted: boolean = false;
  public readonly credentials$: Observable<User> = this._credentials.asObservable();

  constructor(private afAuth: AngularFireAuth, private dialog: MatDialog, private lazyLoadingService: LazyLoadingService) {
  }

  public initAuth(): void {
    this.afAuth.authState.subscribe(async (user) => {
      try {
        if (!user) {
          await this.signInAnonymously();
        } else {
          this._credentials.next(AuthService.getUserDataObject(user));
          if (!user.emailVerified && !this.firstUserSession) {
            setTimeout(this.openEmailVerificationDialog.bind(this), AuthService.EMAIL_VERIFICATION_DIALOG_TIMEOUT_SEC * 1000);
          }
        }
        this.dispatchInitAuthCompleteEvent();
      } catch (e) {
        if (!this.initialAuthCompleted) {
          AppService.dispatchAppInitError({anchor: 'AuthService.initAuth', error: e});
        }
      }
    });
  }

  private dispatchInitAuthCompleteEvent(): void {
    if (this.initialAuthCompleted) {
      return;
    }

    document.dispatchEvent(new Event(AppEventNames.INIT_AUTH_SUCCESS));
    this.initialAuthCompleted = true;
  }

  private async signInAnonymously(): Promise<void> {
    await this.afAuth.signInAnonymously();
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
  public updateCurrentUserData(): void {
    this.afAuth.currentUser
      .then(user => this._credentials.next(AuthService.getUserDataObject(user)))
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
          email: this.credentials.email,
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

  get credentials(): User {
    return this._credentials.value;
  }

  private static getUserDataObject(fireUser: firebase.User): User {
    return {
      uid: fireUser.uid,
      displayName: fireUser.displayName,
      email: fireUser.email,
      photoURL: fireUser.photoURL,
      emailVerified: fireUser.emailVerified,
      isAnonymous: fireUser.isAnonymous
    }
  }
}
