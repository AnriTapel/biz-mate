import {Injectable} from '@angular/core';
import {BizMateUser} from "../../models/BizMateUser";
import {AppService} from "../app/app.service";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/MatDialogConfig";
import {BehaviorSubject, Observable} from "rxjs";
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail,
  updateProfile,
  User
} from "@angular/fire/auth";
import {EventObserver} from "../event-observer/event-observer.service";
import {InitAuthEvent} from "../../events/InitAuthEvent";
import {AppErrorEvent} from "../../events/AppErrorEvent";
import {environment} from "../../../environments/environment";
import {DialogModuleNames} from "../../dialogs/DialogModuleNames";
import {OpenDialogEvent} from "../../events/OpenDialogEvent";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static readonly EMAIL_VERIFICATION_DIALOG_TIMEOUT_SEC: number = 5;

  private _credentials: BehaviorSubject<BizMateUser> = new BehaviorSubject<BizMateUser>({isAnonymous: true, uid: null});
  private firstUserSession: boolean = undefined;
  private initialAuthCompleted: boolean = false;
  public readonly credentials$: Observable<BizMateUser> = this._credentials.asObservable();

  constructor(private auth: Auth, private eventObserver: EventObserver) {
  }

  public initAuth(): void {
    authState(this.auth).subscribe(async (user) => {
      try {
        if (!user) {
          await this.signInAnonymously();
        } else {
          this._credentials.next(AuthService.getUserDataObject(user));
          if (!user.isAnonymous && !user.emailVerified && !this.firstUserSession) {
            setTimeout(this.openEmailVerificationDialog.bind(this), AuthService.EMAIL_VERIFICATION_DIALOG_TIMEOUT_SEC * 1000);
          }
        }
        this.dispatchInitAuthCompleteEvent();
      } catch (e) {
        console.error(e);
        if (!this.initialAuthCompleted) {
          this.eventObserver.dispatchEvent(new InitAuthEvent(false));
          this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'AuthService.initAuth', error: e}))
        }
      }
    });
  }

  private dispatchInitAuthCompleteEvent(): void {
    if (this.initialAuthCompleted) {
      return;
    }
    this.eventObserver.dispatchEvent(new InitAuthEvent());
    this.initialAuthCompleted = true;
  }

  private async signInAnonymously(): Promise<void> {
    await signInAnonymously(this.auth);
  }

  public emailAndPasswordLogin(credentials: any): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await signInWithEmailAndPassword(this.auth, credentials.login, credentials.password);
        resolve();
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'AuthService.emailAndPasswordLogin', error: e}));
        reject(e);
      }
    });
  }

  public async emailPasswordSignUp(credentials: any): Promise<void> {
    try {
      // This param is used to avoid showing unnecessary "Confirm email" dialog after user signed up and authState changed
      this.firstUserSession = true;
      await createUserWithEmailAndPassword(this.auth, credentials.email, credentials.password);
      await updateProfile(this.getAuthCurrentUser(), {
        displayName: credentials.name,
        photoURL: AppService.getDefaultAvatar()
      });
      this.updateCurrentUserData();
      this.sendEmailVerification();
    } catch (e) {
      console.error(e);
      this.firstUserSession = undefined;
      this.signOut();
      this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'AuthService.emailPasswordSignUp', error: e}));
    }
  }

  public updateUserEmail(newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      updateEmail(this.getAuthCurrentUser(), newValue)
        .then(() => {
          this.updateCurrentUserData();
          this.sendEmailVerification();
          resolve();
        })
        .catch((e) => {
          console.error(e);
          this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'AuthService.updateUserEmail', error: e}));
          reject();
        });
    });
  }

  public resetPasswordByEmail(email: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      sendPasswordResetEmail(this.auth, email, {
        url: `${environment.domain}?password_reset=true`
      })
        .then((res) => resolve(res))
        .catch((e) => {
          console.error(e);
          this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'AuthService.resetPasswordByEmail', error: e}));
          reject(e);
        });
    });
  }

  public updateUserDisplayNameOrPhotoURL(field: string, newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      updateProfile(this.getAuthCurrentUser(), {[field]: newValue})
        .then(() => {
          this.updateCurrentUserData();
          resolve();
        })
        .catch((e) => {
          console.error(e);
          this.eventObserver.dispatchEvent(new AppErrorEvent({
            anchor: 'AuthService.updateUserDisplayNameOrPhotoURL',
            error: e
          }));
          reject(e);
        });
    });
  }

  // Update this.user when firebaseUser data is changed
  public updateCurrentUserData(): void {
    this._credentials.next(AuthService.getUserDataObject(this.getAuthCurrentUser()));
  }

  public googleAuth(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this.auth, provider);
        resolve();
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'AuthService.googleAuth', error: e}));
        reject(e);
      }
    });
  }

  public sendEmailVerification(): void {
    try {
      sendEmailVerification(this.getAuthCurrentUser(), {
        url: `${environment.domain}?email_verify=true`
      });
    } catch (e) {
      console.error('AuthService.sendEmailVerification', e);
    }
  }

  private openEmailVerificationDialog(): void {
    this.eventObserver.dispatchEvent(new OpenDialogEvent(
      DialogModuleNames.EMAIL_VERIFY_MESSAGE_MODULE_NAME,
      MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {email: this.credentials.email, alreadySent: false}))
    );
  }

  public async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (e) {
      console.error(e);
      this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'AuthService.signOut', error: e}));
    }
  }

  get credentials(): BizMateUser {
    return this._credentials.value;
  }

  private static getUserDataObject(fireUser: any): BizMateUser {
    return {
      uid: fireUser.uid,
      displayName: fireUser.displayName,
      email: fireUser.email,
      photoURL: fireUser.photoURL,
      emailVerified: fireUser.emailVerified,
      isAnonymous: fireUser.isAnonymous
    }
  }

  private getAuthCurrentUser(): User {
    return this.auth.currentUser;
  }
}
