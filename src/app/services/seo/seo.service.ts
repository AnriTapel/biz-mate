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
    for (const key of Object.keys(data)) {
      switch (key) {
        case 'title':
          this.setTitleTags(data[key]);
          break;
        case 'description':
          this.setDescriptionTags(data[key]);
          break;
        case 'keywords':
          this.meta.updateTag({property: 'keywords', content: data[key]});
          break;
        case 'site':
          this.meta.updateTag({property: 'twitter:site', content: `https://biz-mate.ru${data[key]}`});
          break;
        default:
          break;
      }
    }
  }

  public updateRouteMetaTagsByOffer(offer: Offer): void {
    const tags = {
      title: `${offer.title} | BizMate`,
      description: offer.desc,
      site: `https://biz-mate.ru/offer/${offer.offerId}`
    };

    this.updateRouteMetaTagsByData(tags);
    if (offer.imagesURL.length) {
      this.meta.updateTag({property: 'twitter:image', content: offer.imagesURL[0]});
      this.meta.updateTag({property: 'og:image', content: offer.imagesURL[0]});
    }
  }

  private setTitleTags(title: string): void {
    this.title.setTitle(title);
    const titleTags = SeoService.TAG_NAME_VALUES.filter(it => it.indexOf('title') > -1);
    titleTags.forEach(it => {
      this.meta.updateTag({property: it, content: title});
    });
  }

  private setDescriptionTags(desc: string): void {
    const descTags = SeoService.TAG_NAME_VALUES.filter(it => it.indexOf('description') > -1);
    descTags.forEach(it => {
      this.meta.updateTag({property: it, content: desc});
    });
  }

}
