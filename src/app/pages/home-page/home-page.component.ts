import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {Offer} from "../../models/Offer";
import {NotificationComponent} from "../../dialogs/notification/notification.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SeoService} from "../../services/seo/seo.service";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {

  public latestOffers$: Observable<Offer[]>;

  private readonly metaTags = {
    title: 'BizMate - поиск партнеров и инвестиций для бизнеса',
    description: 'Сервис BizMate помогает найти партнёра по бизнесу, привлечь или предложить инвестиции, а также продать работающий бизнес. И все это абсолютно бесплатно!',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: location.href,
  };
  private readonly resetPasswordEvent = {
    title: 'Пароль изменен',
    text: 'Вы успешно сменили пароль к своей учетной записи!'
  };


  constructor(private db: AngularFirestore, private route: ActivatedRoute, private dialog: MatDialog,
              private seoService: SeoService) {
    this.route.queryParams.subscribe(params => {
      if (params['password_reset']) {
        this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.resetPasswordEvent))
      }
    });
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.getLatestOffers();
  }

  ngOnDestroy(): void {
    window.scrollTo(0,0);
  }

  private async getLatestOffers(): Promise<void> {
    let initialQuery = await this.db.collection<Offer>('/offers').ref
        .orderBy('date', 'desc').limit(5).get();

    let offers = [];

    if (!initialQuery.empty) {
      initialQuery.forEach(it => offers.push(it.data()));
      this.latestOffers$ = of(offers);
    }
  }
}
