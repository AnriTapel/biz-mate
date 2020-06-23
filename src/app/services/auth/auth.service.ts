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

  public appInitAuth(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.useDeviceLanguage();
      let handler = this.afAuth.authState.subscribe((userData) => {
        if (userData && !userData.isAnonymous) {
          this.user = {
            displayName: userData.displayName, uid: userData.uid,
            email: userData.email, photoURL: userData.photoURL,
            emailVerified: userData.emailVerified
          };

          resolve();
        } else if (!userData) {
          this.afAuth.signInAnonymously().then(() => {
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

  public emailAndPasswordLogin(credentials: any): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.afAuth.signInWithEmailAndPassword(credentials.login, credentials.password);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  public async emailPasswordSignUp(credentials: any): Promise<void> {
    try {
      await this.afAuth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      let userData = await this.afAuth.currentUser;
      userData.displayName = credentials.name;
      userData.photoURL = AppService.getDefaultAvatar();
      await this.afAuth.updateCurrentUser(userData);
      await this.updateCurrentUserData();
      await this.sendEmailVerification();
    } catch (e) {
      console.error(e);
    }
  }

  public updateUserEmail(newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.currentUser.then((user) => {
        user.updateEmail(newValue).then(() => {
          user.sendEmailVerification();
          resolve();
        }).catch(() => reject())
      });
    });
  }

  public resetPasswordByEmail(email: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.sendPasswordResetEmail(email, {
        url: 'https://biz-mate.ru/?password_reset=true'
      })
        .then((res) => resolve(res))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  public updateUserDisplayNameOrPhotoURL(field: string, newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.currentUser.then(user => {
        user.updateProfile({[field]: newValue})
          .then(() => resolve())
          .catch(() => reject());
      });
    });
  }

  // Update this.user when firebaseUser data is changed
  public async updateCurrentUserData(): Promise<User> {
    let user = await this.afAuth.currentUser;
    if (user) {
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
    }
    return this.user;
  }

  public googleAuth(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const provider = new auth.GoogleAuthProvider();
        await this.afAuth.signInWithPopup(provider);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  public sendEmailVerification(): void {
    this.afAuth.currentUser.then((user) => {
      user.sendEmailVerification({
        url: 'https://biz-mate.ru/profile?email_verify=true'
      });
    });
  }

  private openEmailVerificationDialog(): void {
    this.dialog.open(EmailVerifyComponent,
      MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {email: this.user.email, alreadySent: false}));
  }

  async signOut(): Promise<void> {
    this.user = null;
    await this.afAuth.signOut();
    await this.afAuth.signInAnonymously();
  }
}
