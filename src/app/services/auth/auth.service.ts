import {Injectable, Injector} from '@angular/core';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {User} from "../../models/User";
import {AppService} from "../app/app.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  user: User;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private injector: Injector) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        // Logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
    this.user$.subscribe((res) => {
      this.user = res;
    });

  }

  appInitAuth(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      let handler = this.afAuth.authState.subscribe((userData) => {
        if (userData) {
          this.afs.doc<User>(`users/${userData.uid}`).valueChanges().subscribe(
            res => {
              this.user = res;
              this.updateEmailVerificationState(userData.emailVerified);
              resolve();
            }, error => { reject(error) });
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
      let userData = await this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      this.updateUserData(userData.user, credentials.name);
      await this.sendEmailVerification();
    } catch (e) {
      console.error("Sign-up error");
      console.log(e);
    }
  }

  async googleAuth(): Promise<void> {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  private async sendEmailVerification(): Promise<void> {
    await this.afAuth.auth.currentUser.sendEmailVerification();
  }

  private async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail);
  }

  private async updateEmailVerificationState(currentState: boolean): Promise<void> {
    if (!this.user.emailVerified && currentState) {
      this.user.emailVerified = true;
      await this.updateUserData(this.user, this.user.displayName);
      const router = this.injector.get(Router);
      router.navigateByUrl('profile');
    }
  }

  private updateUserData(user, name?: string): Promise<void> {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const displayName = name ? name : user.displayName || user.email;

    const data = {
      uid: user.uid,
      email: user.email,
      profilePhoto: user.profilePhoto || AppService.getDefaultAvatar(),
      displayName: displayName,
      emailVerified: user.emailVerified
    };

    return userRef.set(data, {merge: true})

  }

  signOut() {
    return this.afAuth.auth.signOut();
  }
}
