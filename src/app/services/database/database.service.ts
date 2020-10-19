import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {Offer} from "../../models/Offer";
import {Observable, of, zip} from "rxjs";
import {map} from "rxjs/operators";
import {FeedbackMessage} from "../../models/FeedbackMessage";
import {StorageService} from "../storage/storage.service";
import {OfferComment} from "../../models/OfferComment";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  static readonly LATEST_OFFERS_CHUNK_SIZE: number = 4;
  static readonly SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE: number = 20;

  private latestSortedOffers$: Observable<Offer[]> = undefined;
  private sortedOffers$: Observable<Offer[]> = undefined;
  private filteredOffers$: Observable<Offer[]> = undefined;
  private lastLoadedSortedOffer: any = undefined;
  private lastLoadedFilteredOffer: any = undefined;
  private allSortedOffersLoaded: boolean = false;
  private allFilteredOffersLoaded: boolean = false;

  private offersCollectionRef: any = undefined;
  private commentsCollectionRef: any = undefined;

  private latestHomePageOffersHandler: any = undefined;

  constructor(private db: AngularFirestore, private storageService: StorageService) {
    this.offersCollectionRef = this.db.collection('offers').ref;
    this.commentsCollectionRef = this.db.collection('offers-comments').ref;
    /*this.offersCollectionChangesHandler = this.offersCollectionRef.orderBy('date', 'desc').onSnapshot((res) => {
      let offers = [];
      res.forEach(it => offers.push(it.data() as Offer));
      console.log(offers);
      this.updateSortedOffers();
      if (this.latestSortedOffers$) {
        this.getLatestOffersForHomePage();
      }
    });*/
  }

  public createId(): string {
    return this.db.createId();
  }

  public async getOfferByOfferId(id: string): Promise<Offer> {
    let offer = await this.offersCollectionRef.doc(id).get();
    return offer.data() as Offer;
  }

  public getUserOffersByUserId(id: string): Promise<Observable<Offer[]>> {
    return new Promise<Observable<Offer[]>>(async (resolve, reject) => {
      try {
        let res = await this.offersCollectionRef.where('userId', '==', id).orderBy('date', 'desc').get();
        if (res.empty) {
          resolve(null);
          return;
        }

        let offers = [];
        res.forEach(it => offers.push(it.data() as Offer));
        resolve(of(offers));
      } catch (e) {
        reject(e);
      }

    });
  }

  public async getLatestOffers(): Promise<Observable<Offer[]>> {
    if (this.latestSortedOffers$) {
      return this.latestSortedOffers$;
    }

    await this.getLatestOffersForHomePage();
    return this.latestSortedOffers$;
  }

  private async getLatestOffersForHomePage(): Promise<void> {
    let res = await this.offersCollectionRef.orderBy('date', 'desc')
      .limit(DatabaseService.LATEST_OFFERS_CHUNK_SIZE).get();
    if (!res || res.empty) {
      this.latestSortedOffers$ = of([]);
      return;
    }

    let offers = [];
    res.forEach(it => offers.push(it.data() as Offer));
    this.latestSortedOffers$ = of(offers);
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

        let offers = [];
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

  public async getFilteredOffersChunk(queryParams: any, nextChunk: boolean = false): Promise<Observable<Offer[]>> {
    return new Promise<Observable<Offer[]>>(async (resolve, reject) => {
      if (!nextChunk) {
        this.allFilteredOffersLoaded = false;
        this.lastLoadedFilteredOffer = null;
      }

      try {
        let query;
        let paramsKeys = Object.keys(queryParams);
        if (paramsKeys.length === 1) {
          query = this.offersCollectionRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE);
        } else if (paramsKeys.length === 2) {
          query = this.offersCollectionRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .where(paramsKeys[1], '==', queryParams[paramsKeys[1]])
            .limit(DatabaseService.SORTED_AND_FILTERED_OFFERS_CHUNK_SIZE);
        } else if (paramsKeys.length === 3) {
          query = await this.offersCollectionRef.orderBy('date', 'desc').where(paramsKeys[0], '==', queryParams[paramsKeys[0]])
            .where(paramsKeys[1], '==', queryParams[paramsKeys[1]])
            .where(paramsKeys[2], '==', queryParams[paramsKeys[2]])
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
    let filterRes = [];
    if (!resp.empty) {
      resp.forEach(it => filterRes.push(it.data()));

      if (loadNextChunk) {
        this.filteredOffers$ = zip(this.filteredOffers$, of(filterRes))
          .pipe(map(x => x[0].concat(x[1])));
      } else {
        this.filteredOffers$ = of<Offer[]>(filterRes);
      }

      this.lastLoadedFilteredOffer = filterRes[filterRes.length - 1];
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
    for (let img of removeImages) {
      this.storageService.deleteUserImage(img);
    }
    return editOffer ? this.offersCollectionRef.doc(offer.offerId).update(offer) :
      this.offersCollectionRef.doc(offer.offerId).set(offer);
  }

  public async updateSortedOffers(): Promise<void> {
    if (!this.sortedOffers$ || !this.lastLoadedSortedOffer) {
      return;
    }

    try {
      let resp = await this.offersCollectionRef.orderBy('date', 'desc').endAt(this.lastLoadedSortedOffer).get();
      if (resp.empty) {
        this.sortedOffers$ = of([]);
        this.lastLoadedSortedOffer = undefined;
        return;
      }

      let offers = [];
      resp.forEach(it => offers.push(it.data() as Offer));
      this.sortedOffers$ = of(offers);
    } catch (e) {
      console.error(e);
      this.sortedOffers$ = undefined;
      this.lastLoadedSortedOffer = undefined;
      this.allSortedOffersLoaded = false;
    }

    try {
      this.getLatestOffersForHomePage();
    } catch (e) {
      console.error(e);
      this.getLatestOffersForHomePage();
    }
  }

  public deleteOffer(offer: Offer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (offer.imagesURL && offer.imagesURL.length) {
        for (let img of offer.imagesURL) {
          this.storageService.deleteUserImage(img);
        }
      }

      this.db.collection('/offers-comments').ref.where('offerId', '==', offer.offerId).get()
        .then((resp) => {
          let batch = this.db.firestore.batch();

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
      let offersRes = await this.offersCollectionRef.where('userId', '==', userId).get();
      let offersBatch = this.db.firestore.batch();
      offersRes.docs.forEach(userDocRef => {
        offersBatch.update(userDocRef.ref, {[field]: newValue});
      });

      await offersBatch.commit();

      if (field !== 'displayName') {
        return;
      }

      let commentsRes = await this.commentsCollectionRef.where('userId', '==', userId).get();
      let commentsBatch = this.db.firestore.batch();

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
      this.commentsCollectionRef.where('offerId', '==', offerId).get()
        .then((res) => {
          if (res.empty) {
            resolve([]);
            return;

          }
          let comments: OfferComment[] = [];
          res.forEach(it => comments.push(it.data() as OfferComment));
          resolve(comments);
        }).catch(() => reject());
    });
  }

  public sendOfferComment(offer: OfferComment): Promise<void> {
    return this.commentsCollectionRef.doc(offer.offerId).set(offer);
  }

  public deleteOfferComment(commentId: string): Promise<void> {
    return this.commentsCollectionRef.doc(commentId).delete();
  }

  public async sendFeedback(message: FeedbackMessage): Promise<void> {
    await this.db.collection('/messages').add(message);
  }


}
