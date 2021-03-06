import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {Offer} from "../../models/Offer";
import {Observable, of, zip} from "rxjs";
import {map} from "rxjs/operators";
import {FeedbackMessage} from "../../models/FeedbackMessage";
import {StorageService} from "../storage/storage.service";
import {OfferComment} from "../../models/OfferComment";
import {FilterField} from "../../models/FilterFields";
import {UserSubscriptions} from "../../models/UserSubscriptions";
import {AppService} from "../app/app.service";
import {City} from "../../models/City";
import {BusinessArea} from "../../models/BusinessArea";
import {OfferTypes} from "../../models/OfferTypes";

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

  private latestSortedOffers$: Observable<Offer[]> = undefined;
  private latestSortedOffersHandler: any = undefined;

  private sortedOffers$: Observable<Offer[]> = undefined;
  private filteredOffers$: Observable<Offer[]> = undefined;
  private lastLoadedSortedOffer: any = undefined;
  private lastLoadedFilteredOffer: any = undefined;
  private allSortedOffersLoaded: boolean = false;
  private allFilteredOffersLoaded: boolean = false;

  private offersCollectionRef: any = undefined;
  private commentsCollectionRef: any = undefined;

  constructor(private db: AngularFirestore, private storageService: StorageService) {
    this.offersCollectionRef = this.db.collection(DatabaseService.OFFERS_COLLECTION_PATH).ref;
    this.commentsCollectionRef = this.db.collection(DatabaseService.COMMENTS_COLLECTION_PATH).ref;
  }

  public createId(): string {
    return this.db.createId();
  }

  public getCitiesCollection(): Promise<City[]> {
    return new Promise<City[]>((resolve, reject) => {
      this.db.collection(DatabaseService.CITIES_COLLECTION_PATH).get().toPromise()
        .then((res) => {
          let cities: City[] = [];
          res.forEach(it => cities.push(it.data() as City));
          cities.sort((a, b) => a.name.localeCompare(b.name));
          resolve(cities);
        }).catch(() => reject(null));
    });
  }

  public getBusinessAreasCollection(): Promise<BusinessArea[]> {
    return new Promise<BusinessArea[]>((resolve, reject) => {
      this.db.collection(DatabaseService.BUSINESS_AREAS_COLLECTION_PATH).ref.get()
        .then((res) => {
          let businessAreas: BusinessArea[] = [];
          res.forEach(it => businessAreas.push(it.data() as City));
          let anyArea = businessAreas.shift();
          businessAreas.sort((a, b) => a.name.localeCompare(b.name)).unshift(anyArea);
          resolve(businessAreas);
        }).catch(() => reject(null));
    });
  }

  public getOfferTypesCollection(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.db.collection(DatabaseService.OFFER_TYPES_COLLECTION_PATH).get().toPromise()
        .then((res) => {
          const offerTypes: any[] = [];
          res.forEach(it => offerTypes.push(it.data()));
          resolve(offerTypes);
        }).catch(() => reject(null));
    });
  }

  public async getOfferByOfferId(id: string): Promise<Offer> {
    const offer = await this.offersCollectionRef.doc(id).get();
    return offer.data() as Offer;
  }

  public getUserOffersByUserId(id: string): Promise<Observable<Offer[]>> {
    return new Promise<Observable<Offer[]>>(async (resolve, reject) => {
      try {
        const res = await this.offersCollectionRef.where('userId', '==', id).orderBy('date', 'desc').get();
        if (res.empty) {
          resolve(null);
          return;
        }

        const offers = [];
        res.forEach(it => offers.push(it.data() as Offer));
        resolve(of(offers));
      } catch (e) {
        reject(e);
      }

    });
  }

  public getLatestOffers(): Observable<Offer[]> {
    if (this.latestSortedOffers$ && this.latestSortedOffersHandler) {
      return this.latestSortedOffers$;
    }

    this.latestSortedOffersHandler = this.offersCollectionRef.orderBy('date', 'desc')
      .limit(DatabaseService.LATEST_OFFERS_CHUNK_SIZE).onSnapshot((res) => {
        if (!res || res.empty) {
          this.latestSortedOffers$ = of([]);
          return;
        }

        const offers = [];
        res.forEach(it => offers.push(it.data() as Offer));
        this.latestSortedOffers$ = of(offers);
        return this.latestSortedOffers$;
      }, (error) => console.log(error));
  }

  public async getSortedOffersChunk(nextChunk: boolean = false): Promise<Observable<Offer[]>> {
    return new Promise<Observable<Offer[]>>(async (resolve, reject) => {
      try {
        let query;
        if (nextChunk) {
          query = await this.offersCollectionRef.orderBy('date', 'desc')
            .limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE).startAfter(this.lastLoadedSortedOffer).get();
        } else {
          if (this.sortedOffers$ != undefined) {
            resolve(this.sortedOffers$);
            return;
          }
          query = await this.offersCollectionRef.orderBy('date', 'desc')
            .limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE).get();
        }

        const offers = [];
        if (!query.empty) {
          query.forEach(it => offers.push(it.data()));
          this.lastLoadedSortedOffer = query.docs[query.docs.length - 1];
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
        this.sortedOffers$ = undefined;
        this.lastLoadedSortedOffer = undefined;
        this.allSortedOffersLoaded = false;
        reject();
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
        let query;
        if (queryParams.length === 1) {
          query = this.offersCollectionRef.orderBy('date', 'desc').where(queryParams[0].name, queryParams[0].operator, queryParams[0].value)
            .limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE);
        } else if (queryParams.length === 2) {
          query = this.offersCollectionRef.orderBy('date', 'desc').where(queryParams[0].name, queryParams[0].operator, queryParams[0].value)
            .where(queryParams[1].name, queryParams[1].operator, queryParams[1].value)
            .limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE);
        } else if (queryParams.length === 3) {
          query = await this.offersCollectionRef.orderBy('date', 'desc').where(queryParams[0].name, queryParams[0].operator, queryParams[0].value)
            .where(queryParams[1].name, queryParams[1].operator, queryParams[1].value)
            .where(queryParams[2].name, queryParams[2].operator, queryParams[2].value)
            .limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE);
        }

        let resp;
        if (nextChunk) {
          resp = await query.startAfter(this.lastLoadedFilteredOffer).get();
        } else {
          resp = await query.get();
        }

        this.resolveFilterQuery(resp, nextChunk) ? resolve(this.filteredOffers$) : resolve(null);
      } catch (e) {
        this.filteredOffers$ = null;
        this.lastLoadedFilteredOffer = null;
        this.allFilteredOffersLoaded = false;
        reject();
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

  public sendOffer(offer: Offer, removeImages: string[], editOffer: boolean): Promise<void> {
    for (const img of removeImages) {
      this.storageService.deleteUserImage(img);
    }
    return editOffer ? this.offersCollectionRef.doc(offer.offerId).update(offer) :
      this.offersCollectionRef.doc(offer.offerId).set(offer);
  }

  public deleteOffer(offer: Offer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (offer.imagesURL && offer.imagesURL.length) {
        for (const img of offer.imagesURL) {
          this.storageService.deleteUserImage(img);
        }
      }

      this.commentsCollectionRef.where('offerId', '==', offer.offerId).get()
        .then((resp) => {
          const batch = this.db.firestore.batch();

          resp.docs.forEach(userDocRef => {
            batch.delete(userDocRef.ref);
          });

          batch.commit().catch(err => console.error(err));
        });

      this.db.collection('/offers').doc(offer.offerId).delete()
        .then(() => resolve())
        .catch(() => reject());
    });
  }

  public async updateUserDataInOffers(userId: string, field: string, newValue: string): Promise<void> {
    try {
      const offersRes = await this.offersCollectionRef.where('userId', '==', userId).get();
      const offersBatch = this.db.firestore.batch();
      offersRes.docs.forEach(userDocRef => {
        offersBatch.update(userDocRef.ref, {[field]: newValue});
      });

      await offersBatch.commit();

      if (field !== 'displayName') {
        return;
      }

      const commentsRes = await this.commentsCollectionRef.where('userId', '==', userId).get();
      const commentsBatch = this.db.firestore.batch();

      commentsRes.docs.forEach(userCommentsRef => {
        commentsBatch.update(userCommentsRef.ref, {[field]: newValue});
      });

      commentsBatch.commit();
    } catch (e) {
      console.error(e);
    }

  }

  public getOfferCommentsByOfferId(offerId: string): Promise<OfferComment[]> {
    return new Promise<OfferComment[]>((resolve, reject) => {
      this.commentsCollectionRef.orderBy('date').where('offerId', '==', offerId).get()
        .then((res) => {
          if (res.empty) {
            resolve([]);
            return;

          }
          const comments: OfferComment[] = [];
          res.forEach(it => comments.push(it.data() as OfferComment));
          resolve(comments);
        }).catch(() => reject());
    });
  }

  public sendOfferComment(comment: OfferComment): Promise<void> {
    return this.commentsCollectionRef.doc(comment.commentId).set(comment);
  }

  public deleteOfferComment(commentId: string): Promise<void> {
    return this.commentsCollectionRef.doc(commentId).delete();
  }

  public async sendFeedback(message: FeedbackMessage): Promise<void> {
    await this.db.collection('/messages').add(message);
  }

  public async getUserSubscriptionsByEmail(email: string): Promise<UserSubscriptions> {
    return new Promise<UserSubscriptions>((resolve, reject) => {
      this.db.collection('user-subscriptions').ref.doc(email).get()
        .then((doc) => resolve(doc.data() as UserSubscriptions))
        .catch(() => resolve(null));
    });
  }

  public async setUserSubscriptionsByEmail(params: UserSubscriptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let ref = this.db.collection('user-subscriptions').ref;
      ref.doc(params.email).get().then((res) => {
        if (res.exists) {
          ref.doc(params.email).update({newOfferAreas: params.newOfferAreas});
        } else {
          ref.doc(params.email).set({email: params.email, newOfferAreas: params.newOfferAreas});
        }
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  // field: field name as string from UserSubscriptions
  public async removeUserSubscriptionByField(email: string, fields: string[]): Promise<void>{
    return new Promise<void>((resolve, reject) => {
      let ref = this.db.collection('user-subscriptions').ref;
      ref.doc(email).get().then((res) => {
        if (res.exists) {
          let data = {};
          fields.forEach(it => data[it] = []);
          ref.doc(email).update(data);
        }
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
