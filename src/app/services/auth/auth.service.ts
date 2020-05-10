import {Injectable} from '@angular/core';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {User} from "../../models/User";
import {Observable, of} from "rxjs";
import {switchMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any>;
  user: User;

  constructor(private afAuth: AngularFireAuth) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          this.user = {
            displayName: user.displayName, uid: user.uid,
            email: user.email, photoURL: user.photoURL,
            emailVerified: user.emailVerified
          };
        } else
          this.user = null;
        return of(user);
      }));
  }

  appInitAuth(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      let handler = this.afAuth.authState.subscribe((userData) => {
        if (userData) {
          this.user = {
            displayName: userData.displayName, uid: userData.uid,
            email: userData.email, photoURL: userData.photoURL,
            emailVerified: userData.emailVerified
          };
          resolve();
        } else {
          this.user = null;
          resolve();
        }
        handler.unsubscribe();
      }, (error) => {
        handler.unsubscribe();
        reject(error);
      });
    });
  }

  async emailAndPasswordLogin(credentials: any): Promise<void> {
    try {
      return await this.afAuth.auth.signInWithEmailAndPassword(credentials.login, credentials.password)
        .then((userData) => {
          console.log(userData);
        }).catch((error) => {
          console.log(error);
        })
    } catch (e) {
      console.error("Login error");
      console.log(e);
    }
  }

  async emailPasswordSignUp(credentials: any): Promise<void> {
    try {
      await this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      await this.sendEmailVerification();
    } catch (e) {
      console.error("Sign-up error");
      console.log(e);
    }
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

  updateUserDisplayNameOrPhotoURL(field: string, newValue: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.currentUser.updateProfile({[field]: newValue})
        .then(() => resolve()).catch(() => reject());
    });
  }

  async googleAuth(): Promise<void> {
    const provider = new auth.GoogleAuthProvider();
    await this.afAuth.auth.signInWithPopup(provider);
  }

  private async sendEmailVerification(): Promise<void> {
    await this.afAuth.auth.currentUser.sendEmailVerification();
  }

  private async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }

  signOut() {
    return this.afAuth.auth.signOut();
  }
}
