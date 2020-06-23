import {Component, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {Offer} from "../../models/Offer";
import {NotificationComponent} from "../../dialogs/notification/notification.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  readonly resetPasswordEvent = {
    title: 'Пароль изменен',
    text: 'Вы успешно сменили пароль к своей учетной записи!'
  };

  latestOffers$: Observable<Offer[]>;

  constructor(private db: AngularFirestore, private route: ActivatedRoute, private dialog: MatDialog) {
    this.route.queryParams.subscribe(params => {
      if (params['password_reset']) {
        this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.resetPasswordEvent))
      }
    });
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
