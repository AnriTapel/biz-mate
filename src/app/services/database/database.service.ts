import {Injectable} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch
} from "@angular/fire/firestore";
import {Offer} from "../../models/Offer";
import {Observable, of, zip} from "rxjs";
import {map} from "rxjs/operators";
import {FeedbackMessage} from "../../models/FeedbackMessage";
import {OfferComment} from "../../models/OfferComment";
import {FilterField} from "../../models/FilterFields";
import {UserSubscriptions} from "../../models/UserSubscriptions";
import {City} from "../../models/City";
import {BusinessArea} from "../../models/BusinessArea";
import {OfferType} from "../../models/IOfferType";
import {EventObserver} from "../event-observer/event-observer.service";
import {AppErrorEvent} from "../../events/AppErrorEvent";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  static readonly LATEST_OFFERS_CHUNK_SIZE: number = 4;
  static readonly SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE: number = 20;
  static readonly OFFERS_COLLECTION_PATH: string = 'offers';
  static readonly COMMENTS_COLLECTION_PATH: string = 'offers-comments';
  static readonly OFFER_TYPES_COLLECTION_PATH: string = 'offers-types';
  static readonly CITIES_COLLECTION_PATH: string = 'cities';
  static readonly BUSINESS_AREAS_COLLECTION_PATH: string = 'business-areas';
  static readonly FEEDBACK_COLLECTION_PATH: string = 'feedback';
  static readonly USER_SUBSCRIPTIONS_COLLECTION_PATH: string = 'user-subscriptions';

  private sortedOffers$: Observable<Offer[]> = undefined;
  private filteredOffers$: Observable<Offer[]> = undefined;
  private lastLoadedSortedOffer: any = undefined;
  private lastLoadedFilteredOffer: any = undefined;
  private allSortedOffersLoaded: boolean = false;
  private allFilteredOffersLoaded: boolean = false;

  private readonly offersCollectionRef: any = undefined;
  private readonly commentsCollectionRef: any = undefined;

  constructor(private firestore: Firestore, private eventObserver: EventObserver) {
    this.offersCollectionRef = collection(this.firestore, DatabaseService.OFFERS_COLLECTION_PATH);
    this.commentsCollectionRef = collection(this.firestore, DatabaseService.COMMENTS_COLLECTION_PATH);
  }

  public static createId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
  }

  public getCitiesCollection(): Promise<City[]> {
    return new Promise<City[]>(async (resolve, reject) => {
      let cities: City[] = [];
      try {
        const querySnapshot = await getDocs(collection(this.firestore, DatabaseService.CITIES_COLLECTION_PATH));
        querySnapshot.forEach((doc) => cities.push(doc.data() as City));
        cities.sort((a, b) => a.name.localeCompare(b.name));
        resolve(cities);
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'DatabaseService.getCitiesCollection', error: e}));
        reject(e);
      }
    });
  }

  public getBusinessAreasCollection(): Promise<BusinessArea[]> {
    return new Promise<BusinessArea[]>(async (resolve, reject) => {
      let businessAreas: BusinessArea[] = [];
      try {
        const querySnapshot = await getDocs(collection(this.firestore, DatabaseService.BUSINESS_AREAS_COLLECTION_PATH));
        querySnapshot.forEach((doc) => businessAreas.push(doc.data() as BusinessArea));
        let anyArea = businessAreas.shift();
        businessAreas.sort((a, b) => a.name.localeCompare(b.name)).unshift(anyArea);
        resolve(businessAreas);
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({
          anchor: 'DatabaseService.getBusinessAreasCollection',
          error: e
        }));
        reject(e);
      }
    });
  }

  public getOfferTypesCollection(): Promise<any[]> {
    return new Promise<OfferType[]>(async (resolve, reject) => {
      let offerTypes: OfferType[] = [];
      try {
        const querySnapshot = await getDocs(collection(this.firestore, DatabaseService.OFFER_TYPES_COLLECTION_PATH));
        querySnapshot.forEach((doc) => offerTypes.push(doc.data() as OfferType));
        resolve(offerTypes);
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({
          anchor: 'DatabaseService.getOfferTypesCollection',
          error: e
        }));
        reject(e);
      }
    });
  }

  public async getOfferByOfferId(id: string): Promise<Offer> {
    try {
      const offer = await getDoc(doc(this.firestore, DatabaseService.OFFERS_COLLECTION_PATH + '/' + id));
      return offer.data() as Offer;
    } catch (e) {
      console.error(e);
      this.eventObserver.dispatchEvent(new AppErrorEvent({anchor: 'DatabaseService.getOfferByOfferId', error: e}));
    }
  }

  public getUserOffersByUserId(id: string): Observable<Offer[]> {
    let q = query<Offer>(this.offersCollectionRef,
      where('userId', '==', id),
      orderBy('date', 'desc')
    );
    return collectionData<Offer>(q);
  }

  public getLatestOffers(): Observable<Offer[]> {
    let q = query<Offer>(this.offersCollectionRef,
      orderBy('date', 'desc'),
      limit(DatabaseService.LATEST_OFFERS_CHUNK_SIZE)
    );
    return collectionData<Offer>(q);
  }

  public async getSortedOffersChunk(nextChunk: boolean = false): Promise<Observable<Offer[]>> {
    return new Promise<Observable<Offer[]>>(async (resolve, reject) => {
      try {
        let q;
        if (nextChunk) {
          q = query(this.offersCollectionRef,
            orderBy('date', 'desc'),
            limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE),
            startAfter(this.lastLoadedSortedOffer));
        } else {
          if (this.sortedOffers$ != undefined) {
            resolve(this.sortedOffers$);
            return;
          }
          q = query(this.offersCollectionRef,
            orderBy('date', 'desc'),
            limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE)
          );
        }

        const offers = [];
        const docs = await getDocs(q);
        if (!docs.empty) {
          docs.forEach(it => offers.push(it.data()));
          this.lastLoadedSortedOffer = docs.docs[docs.docs.length - 1];
          if (offers.length < DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE) {
            this.allSortedOffersLoaded = true;
          }

          if (nextChunk) {
            this.sortedOffers$ = zip(this.sortedOffers$, of(offers))
              .pipe(map(x => x[0].concat(x[1])));
          } else {
            this.sortedOffers$ = of(offers);
          }
        } else if (nextChunk) {
          this.allSortedOffersLoaded = true;
        } else {
          this.sortedOffers$ = of([]);
          this.allSortedOffersLoaded = true;
        }
        resolve(this.sortedOffers$);
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({
          anchor: 'DatabaseService.getSortedOffersChunk',
          error: e
        }));
        this.sortedOffers$ = undefined;
        this.lastLoadedSortedOffer = undefined;
        this.allSortedOffersLoaded = false;
        reject(e);
      }
    });
  }

  public clearSortedOffers(): void {
    this.sortedOffers$ = undefined;
    this.lastLoadedSortedOffer = undefined;
    this.allSortedOffersLoaded = false;
  }

  public async getFilteredOffersChunk(queryParams: FilterField[], nextChunk: boolean = false): Promise<Observable<Offer[]>> {
    return new Promise<Observable<Offer[]>>(async (resolve, reject) => {
      if (!nextChunk) {
        this.allFilteredOffersLoaded = false;
        this.lastLoadedFilteredOffer = null;
      }

      try {
        let q;
        if (queryParams.length === 1) {
          q = nextChunk
            ? query(this.offersCollectionRef, orderBy('date', 'desc'), where(queryParams[0].name, queryParams[0].operator, queryParams[0].value), limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE), startAfter(this.lastLoadedFilteredOffer))
            : query(this.offersCollectionRef, orderBy('date', 'desc'), where(queryParams[0].name, queryParams[0].operator, queryParams[0].value), limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE))
        } else if (queryParams.length === 2) {
          q = nextChunk
            ? query(this.offersCollectionRef, orderBy('date', 'desc'), where(queryParams[0].name, queryParams[0].operator, queryParams[0].value), where(queryParams[1].name, queryParams[1].operator, queryParams[1].value), limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE), startAfter(this.lastLoadedFilteredOffer))
            : query(this.offersCollectionRef, orderBy('date', 'desc'), where(queryParams[0].name, queryParams[0].operator, queryParams[0].value), where(queryParams[1].name, queryParams[1].operator, queryParams[1].value), limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE));
        } else if (queryParams.length === 3) {
          q = nextChunk
            ? query(this.offersCollectionRef, orderBy('date', 'desc'), where(queryParams[0].name, queryParams[0].operator, queryParams[0].value), where(queryParams[1].name, queryParams[1].operator, queryParams[1].value), where(queryParams[2].name, queryParams[2].operator, queryParams[2].value), limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE), startAfter(this.lastLoadedFilteredOffer))
            : query(this.offersCollectionRef, orderBy('date', 'desc'), where(queryParams[0].name, queryParams[0].operator, queryParams[0].value), where(queryParams[1].name, queryParams[1].operator, queryParams[1].value), where(queryParams[2].name, queryParams[2].operator, queryParams[2].value), limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE));
        }

        let resp = await getDocs(q);
        this.resolveFilterQuery(resp, nextChunk) ? resolve(this.filteredOffers$) : resolve(null);
      } catch (e) {
        this.eventObserver.dispatchEvent(new AppErrorEvent({
          anchor: 'DatabaseService.getFilteredOffersChunk',
          error: e
        }));
        this.filteredOffers$ = null;
        this.lastLoadedFilteredOffer = null;
        this.allFilteredOffersLoaded = false;
        reject(e);
      }
    });
  }

  // Return true if first filter query isn't empty, otherwise return false
  private resolveFilterQuery(resp: any, loadNextChunk: boolean): boolean {
    const filterRes = [];
    if (!resp.empty) {
      resp.forEach(it => filterRes.push(it.data()));
      this.lastLoadedFilteredOffer = resp.docs[resp.docs.length - 1];

      if (loadNextChunk) {
        this.filteredOffers$ = zip(this.filteredOffers$, of(filterRes))
          .pipe(map(x => x[0].concat(x[1])));
      } else {
        this.filteredOffers$ = of<Offer[]>(filterRes);
      }

      if (filterRes.length < DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE) {
        this.allFilteredOffersLoaded = true;
      }
      return true;
    } else if (!loadNextChunk) {
      this.filteredOffers$ = undefined;
      return false;
    }
  }

  public areAllSortedOffersLoaded(): boolean {
    return this.allSortedOffersLoaded;
  }

  public areAllFilteredOffersLoaded(): boolean {
    return this.allFilteredOffersLoaded;
  }

  public async sendOffer(offer: Offer, editOffer: boolean): Promise<void> {
    return editOffer ?
      await updateDoc(doc(this.offersCollectionRef, offer.offerId), offer) :
      await setDoc(doc(this.offersCollectionRef, offer.offerId), offer)
  }

  public async deleteOffer(offer: Offer): Promise<void> {
      const offerRes = await doc(this.firestore, `${DatabaseService.OFFERS_COLLECTION_PATH}/${offer.offerId}`);
      await deleteDoc(offerRes);
  }

  // Called when users' personal info is changed (name, avatar etc.)
  public async updateUserDataInOffers(userId: string, field: string, newValue: string): Promise<void> {
    try {
      const offersRes = await getDocs(query<Offer[]>(this.offersCollectionRef, where('userId', '==', userId)));
      const offersBatch = writeBatch(this.firestore);
      offersRes.docs.forEach(userDocRef => {
        //@ts-ignore
        offersBatch.update(userDocRef.ref, {[field]: newValue});
      });

      await offersBatch.commit();

      if (field !== 'displayName') {
        return;
      }

      const commentsRes = await getDocs(query<Offer[]>(this.commentsCollectionRef, where('userId', '==', userId)));
      const commentsBatch = writeBatch(this.firestore);

      commentsRes.docs.forEach(userCommentsRef => {
        //@ts-ignore
        commentsBatch.update(userCommentsRef.ref, {[field]: newValue});
      });

      commentsBatch.commit();
    } catch (e) {
      console.error(e);
      this.eventObserver.dispatchEvent(new AppErrorEvent({
        anchor: 'DatabaseService.updateUserDataInOffers',
        error: e
      }));
    }

  }

  public getOfferCommentsByOfferId(offerId: string): Observable<OfferComment[]> {
    let q = query<OfferComment>(this.commentsCollectionRef,
      where('offerId', '==', offerId),
      orderBy('date')
    );
    return collectionData<OfferComment>(q);
  }

  public sendOfferComment(comment: OfferComment): Promise<void> {
    return setDoc(doc(this.firestore, `${DatabaseService.COMMENTS_COLLECTION_PATH}/${comment.commentId}`), comment);
  }

  public deleteOfferComment(commentId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${DatabaseService.COMMENTS_COLLECTION_PATH}/${commentId}`))
  }

  public async sendFeedback(message: FeedbackMessage): Promise<void> {
    await addDoc(collection(this.firestore, DatabaseService.FEEDBACK_COLLECTION_PATH), message);
  }

  public async getUserSubscriptionsByEmail(email: string): Promise<UserSubscriptions> {
    return new Promise<UserSubscriptions>(async (resolve) => {
      try {
        let d = await getDoc(doc(this.firestore, `${DatabaseService.USER_SUBSCRIPTIONS_COLLECTION_PATH}/${email}`));
        resolve(d.data() as UserSubscriptions);
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({
          anchor: 'DatabaseService.getUserSubscriptionsByEmail',
          error: e
        }));
        resolve(e);
      }
    });
  }

  public async setUserSubscriptionsByEmail(params: UserSubscriptions): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let docRef = doc(this.firestore, `${DatabaseService.USER_SUBSCRIPTIONS_COLLECTION_PATH}/${params.email}`);
        let d = await getDoc(docRef);
        if (d.exists()) {
          await updateDoc(docRef, {newOfferAreas: params.newOfferAreas})
        } else {
          await setDoc(docRef, {email: params.email, newOfferAreas: params.newOfferAreas});
        }
        resolve();
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({
          anchor: 'DatabaseService.setUserSubscriptionsByEmail',
          error: e
        }));
        reject(e);
      }
    });
  }

  // field: field name as string from UserSubscriptions
  public async removeUserSubscriptionByField(email: string, fields: string[]): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let docRef = doc(this.firestore, `${DatabaseService.USER_SUBSCRIPTIONS_COLLECTION_PATH}/${email}`);
        let d = await getDoc(docRef);
        if (d.exists()) {
          let data = {};
          fields.forEach(it => data[it] = []);
          await updateDoc(docRef, data);
        }
      } catch (e) {
        console.error(e);
        this.eventObserver.dispatchEvent(new AppErrorEvent({
          anchor: 'DatabaseService.removeUserSubscriptionByField',
          error: e
        }));
        reject(e);
      }
    });
  }
}
