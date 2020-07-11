import {Injectable} from '@angular/core';
import {Meta, Title} from "@angular/platform-browser";
import {Offer} from "../../models/Offer";

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  static readonly TAG_NAME_VALUES = ['keywords', 'description',
    'og:title', 'og:description', 'og:type', 'og:site_name', 'og:image',
    'twitter:card', 'twitter:title', 'twitter:description', 'twitter:site'
  ];

  constructor(private meta: Meta, private title: Title) {
  }

  public updateRouteMetaTagsByData(data: any): void {
    this.clearPreviousRouteTags();

    for (let key of Object.keys(data)) {
      switch (key) {
        case 'title':
          this.setTitleTags(data[key]);
          break;
        case 'description':
          this.setDescriptionTags(data[key]);
          this.meta.addTags([
            {name: 'og:site_name', content: 'BizMate'},
            {name: 'og:type', content: 'website'},
            {name: 'twitter:card', content: 'summary'}
          ]);
          break;
        case 'keywords':
          this.meta.addTag({name: 'keywords', content: data[key]});
          break;
        case 'site':
          this.meta.addTag({name: 'twitter:site', content: data[key]});
          break;
        default:
          break;
      }
    }
  }

  public updateRouteMetaTagsByOffer(offer: Offer): void {
    this.clearPreviousRouteTags();

    let tags = {
      title: `${offer.title} | BizMate`,
      description: offer.desc,
      site: `https://biz-mate.ru/offer/${offer.offerId}`
    };

    this.updateRouteMetaTagsByData(tags);
    if (offer.imagesURL.length) {
      this.meta.addTags([
        {name: 'twitter:image', content: offer.imagesURL[0]},
        {name: 'og:image', content: offer.imagesURL[0]}
      ]);
    }
  }

  private setTitleTags(title: string): void {
    this.title.setTitle(title);
    let titleTags = SeoService.TAG_NAME_VALUES.filter(it => it.indexOf('title') > -1);
    titleTags.forEach(it => {
      this.meta.addTag({name: it, content: title});
    });
  }

  private setDescriptionTags(desc: string): void {
    let descTags = SeoService.TAG_NAME_VALUES.filter(it => it.indexOf('description') > -1);
    descTags.forEach(it => {
      this.meta.addTag({name: it, content: desc});
    });
  }

  private clearPreviousRouteTags(): void {
    SeoService.TAG_NAME_VALUES.forEach(it => {
      this.meta.removeTag(`name='${it}'`);
    });
  }

}
