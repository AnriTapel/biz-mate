import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {ActivatedRoute, Router} from "@angular/router";
import {Offer} from "../../models/Offer";
import {AppService} from "../../services/app/app.service";
import {SeoService} from "../../services/seo/seo.service";
import {ComponentBrowserAbstractClass} from "../../models/ComponentBrowserAbstractClass";
import {OverlayService} from "../../services/overlay/overlay.service";

@Component({
  selector: 'app-offer-page',
  templateUrl: './offer-page.component.html',
  styleUrls: ['./offer-page.component.scss']
})
export class OfferPageComponent extends ComponentBrowserAbstractClass {

  public offer: Offer = null;

  constructor(private db: AngularFirestore, private route: ActivatedRoute, private seoService: SeoService, private router: Router) {
    super();
    OverlayService.showOverlay();
    db.collection('/offers').doc(route.snapshot.paramMap.get("id").toString()).get().subscribe((doc) => {
      if (!doc.exists) {
        console.error('No such document!');
      } else {
        this.offer = doc.data() as Offer;
        this.seoService.updateRouteMetaTagsByOffer(this.offer);
      }
    }, (err) => {
      console.error(err);
    }, () => {
      OverlayService.hideOverlay();
    });
  }

  public getOfferDate(): string {
    return AppService.getOfferDate(this.offer);
  }

  public getOfferCity(): string {
    return AppService.getCityByFiledValue('id', this.offer.city).name;
  }

  public getOfferBusinessArea(): string {
    return AppService.getBusinessAreaByFiledValue('id', this.offer.businessArea).name;
  }

  public getOfferTypeTitle(): string {
    return AppService.offerTypes.filter(it => it.id === this.offer.type)[0].title;
  }

  public getCapitalLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].capital;
  }

  public getCapitalValueAsString(): string {
    return this.offer.capital.toLocaleString('ru');
  }

  public getConditionsLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].conditions;
  }

  public getExperienceLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].experience;
  }

  public openImage(url: string): void {
    window.open(url, '_blank');
  }

  public openOffersPageByFilter(field: string): void {
    switch (field) {
      case 'city':
        this.router.navigate(['/offers-page'], {queryParams: {city: this.offer.city}});
        break;
      case 'type':
        this.router.navigate(['/offers-page'], {queryParams: {offerType: this.offer.type}});
        break;
      case 'businessArea':
        this.router.navigate(['/offers-page'], {queryParams: {businessArea: this.offer.businessArea}});
        break;
      default:
        break;
    }
  }

  public isContactMethodSelected(): boolean {
    if (!this.offer.contactMethods)
      return false;

    for (let key of Object.keys(this.offer.contactMethods)) {
      if (this.offer.contactMethods[key])
        return true;
    }
    return false;
  }
}
