import {Component, OnDestroy} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {ActivatedRoute} from "@angular/router";
import {Offer} from "../../models/Offer";
import {AppService} from "../../services/app/app.service";
import {SeoService} from "../../services/seo/seo.service";

@Component({
  selector: 'app-offer-page',
  templateUrl: './offer-page.component.html',
  styleUrls: ['./offer-page.component.scss']
})
export class OfferPageComponent implements OnDestroy {

  public offer: Offer = null;

  constructor(private db: AngularFirestore, private route: ActivatedRoute, private seoService: SeoService) {
    AppService.showOverlay();
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
      AppService.hideOverlay();
    });
  }

  ngOnDestroy(): void {
    window.scrollTo(0,0);
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

  public getConditionsLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].conditions;
  }

  public getExperienceLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].experience;
  }

  public openImage(url: string): void {
    window.open(url, '_blank');
  }


  public isContactMethodSelected(): boolean {
    if (!this.offer.contactMethods)
      return false;

    for (let key of Object.keys(this.offer.contactMethods)){
      if (this.offer.contactMethods[key])
        return true;
    }
    return false;
  }
}
