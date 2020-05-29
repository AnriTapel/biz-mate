import {Component, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {Offer} from "../../models/Offer";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  latestOffers$: Observable<Offer[]>;

  constructor(private db: AngularFirestore) {
  }

  ngOnInit(): void {
    this.getLatestOffers();
    scroll(0,0);
  }

  async getLatestOffers(): Promise<void> {
    let initialQuery = await this.db.collection<Offer>('/offers').ref
        .orderBy('date', 'desc').limit(5).get();

    let offers = [];

    if (!initialQuery.empty) {
      initialQuery.forEach(it => offers.push(it.data()));
      this.latestOffers$ = of(offers);
    }
  }
}
