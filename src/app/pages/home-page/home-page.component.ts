import {Component, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {Offer} from "../../models/Offer";
import {NotificationComponent} from "../../dialogs/notification/notification.component";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";
import {ActivatedRoute} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OfferTypes} from "../../models/OfferTypes";
import {AppService} from "../../services/app/app.service";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent extends ComponentBrowserAbstractClass implements OnInit {

  public latestOffers$: Observable<Offer[]>;

  private readonly metaTags = {
    title: 'BizMate - поиск партнеров и инвестиций для бизнеса',
    description: 'Сервис BizMate помогает найти партнёра по бизнесу, привлечь или предложить инвестиции, а также продать работающий бизнес. И все это абсолютно бесплатно!',
    keywords: 'бизнес инвестор, партнер по бизнесу, инвестор искать, куда вклыдвать деньги, вложить в бизнес, купить бизнес, купить готовый бизнес, начинающий бизнес, бизнес партнер, частный инвестор',
    site: '',
  };

  private readonly resetPasswordEvent = {
    title: 'Пароль изменен',
    text: 'Вы успешно сменили пароль к своей учетной записи!'
  };

  private readonly emailVerifyEvent = {
    title: 'Электронная почта подтверждена',
    text: 'Вы успешно подтвердили свой адрес электронной почты! Теперь Вы можете отредактировать информацию о себе и перейти к созданию своего первого оффера.'
  };

  public readonly  offerTypesBlockData = [
    {title: AppService.getOfferTypeByFiledValue('id', OfferTypes.NEED_INVESTMENTS).title, desc: 'Подойдет для стартапов и перспективных проектов на начальном этапе, а также для тех, кто хочет масштабировать действующие бизнес'},
    {title: AppService.getOfferTypeByFiledValue('id', OfferTypes.HAVE_INVESTMENTS).title, desc: 'Для тех, кто обладает свободным капиталом и хочет вложиться в потенциально прибыльное дело или выкупить долю в активном проекте'},
    {title: AppService.getOfferTypeByFiledValue('id', OfferTypes.NEED_PARTNER).title, desc: 'Думаете о запуске нового проекта или являетесь частью уже активного бизнеса и желаете найти единомышленников для его развития'},
    {title: AppService.getOfferTypeByFiledValue('id', OfferTypes.SEARCH_BUSINESS).title, desc: 'Обладаете определенными навыками, богатым опытом в какой-либо сфере или другими материальными и нематериальными ценностями и хотите поделиться ими на взаимовыгодных условиях'},
    {title: AppService.getOfferTypeByFiledValue('id', OfferTypes.SELL_BUSINESS).title, desc: 'Решили отойти от дел и желаете зафиксировать прибыль или нашли более перспективный проект, в который хотите полностью погрузиться и вложить вырученные средства'}
  ];

  constructor(private db: AngularFirestore, private route: ActivatedRoute, private dialog: MatDialog,
              private seoService: SeoService) {
    super();
    this.route.queryParams.subscribe(params => {
      if (params['password_reset']) {
        this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.resetPasswordEvent))
      } else this.route.queryParams.subscribe(params => {
        if (params['email_verify']) {
          this.dialog.open(NotificationComponent, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, this.emailVerifyEvent))
        }
      });
    });
  }

  ngOnInit(): void {
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
    this.getLatestOffers();
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
