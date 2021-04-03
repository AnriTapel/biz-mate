import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Offer} from "../../models/Offer";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OfferTypesEnum} from "../../models/IOfferType";
import {AppService} from "../../services/app/app.service";
import {DatabaseService} from "../../services/database/database.service";

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

  public readonly offerTypesBlockData = [
    {
      title: this.appService.getOfferTypeByFiledValue('id', OfferTypesEnum.NEED_INVESTMENTS).title,
      desc: 'Подойдет для стартапов и перспективных проектов на начальном этапе, а также для тех, кто хочет масштабировать действующие бизнес'
    },
    {
      title: this.appService.getOfferTypeByFiledValue('id', OfferTypesEnum.HAVE_INVESTMENTS).title,
      desc: 'Для тех, кто обладает свободным капиталом и хочет вложиться в потенциально прибыльное дело или выкупить долю в активном проекте'
    },
    {
      title: this.appService.getOfferTypeByFiledValue('id', OfferTypesEnum.NEED_PARTNER).title,
      desc: 'Думаете о запуске нового проекта или являетесь частью уже активного бизнеса и желаете найти единомышленников для его развития'
    },
    {
      title: this.appService.getOfferTypeByFiledValue('id', OfferTypesEnum.SEARCH_BUSINESS).title,
      desc: 'Обладаете определенными навыками, богатым опытом в какой-либо сфере или другими материальными и нематериальными ценностями и хотите поделиться ими на взаимовыгодных условиях'
    },
    {
      title: this.appService.getOfferTypeByFiledValue('id', OfferTypesEnum.SELL_BUSINESS).title,
      desc: 'Решили отойти от дел и желаете зафиксировать прибыль или нашли более перспективный проект, в который хотите полностью погрузиться и вложить вырученные средства'
    }
  ];

  constructor(private databaseService: DatabaseService, private seoService: SeoService, private appService: AppService) {
    super();
  }

  ngOnInit(): void {
    this.getLatestOffers();
    this.seoService.updateRouteMetaTagsByData(this.metaTags);
  }

  private getLatestOffers(): void {
    this.latestOffers$ = this.databaseService.getLatestOffers();
  }
}
