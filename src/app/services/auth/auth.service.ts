import {Injectable, Injector} from '@angular/core';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {User} from "../../models/User";
import {NewOffer} from "../../models/NewOffer";
import {AppService} from "../../app.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  user: User;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
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
      let handler = this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.afs.doc<User>(`users/${user.uid}`).valueChanges()
            .subscribe(res => {
              this.user = res;
              handler.unsubscribe();
              resolve();
            }, error => {
              reject(error);
              handler.unsubscribe()
            });
        } else {
          this.user = null;
          handler.unsubscribe();
          resolve();
        }
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
      await this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password).then(
        (userData) => {
          return this.updateUserData(userData.user, credentials.name);
        });
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

  private updateUserData(user, name?: string): Promise<void> {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const displayName = name ? name : user.displayName || user.email;

    const data = {
      uid: user.uid,
      email: user.email,
      photoURL: user.profilePhoto || AppService.getDefaultAvatar(),
      displayName: displayName,
      emailVerified: user.emailVerified
    };

    return userRef.set(data, {merge: true})

  }



  signOut() {
    return this.afAuth.auth.signOut();
  }
}
