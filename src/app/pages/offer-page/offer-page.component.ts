import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {ActivatedRoute} from "@angular/router";
import {NewOffer} from "../../models/NewOffer";
import {AppService} from "../../app.service";

@Component({
  selector: 'app-offer-page',
  templateUrl: './offer-page.component.html',
  styleUrls: ['./offer-page.component.scss']
})
export class OfferPageComponent implements OnInit {

  offer: NewOffer = null;

  constructor(private db: AngularFirestore, private route: ActivatedRoute) {
    db.collection('/offers').doc(route.snapshot.paramMap.get("id").toString()).get().subscribe((doc) => {
      if (!doc.exists) {
        console.error('No such document!');
      } else {
        this.offer = doc.data() as NewOffer;
      }
    }, (err) => {
      console.error(err);
    });
  }

  ngOnInit(): void {
  }

  getOfferDate(): string {
    return AppService.getOfferDate(this.offer);
  }

  getOfferCity(): string {
    return AppService.getCityByFiledValue('id', this.offer.city).name;
  }

  getOfferBusinessAreas(): string {
    let businessAreas: string = '';

    this.offer.business_areas.forEach(it =>
      businessAreas += `${AppService.getBusinessAreaByFiledValue('id', it).name}, `);

    return businessAreas.substr(0, businessAreas.length - 2);
  }

  getOfferTypeTitle(): string {
    return AppService.offerTypes.filter(it => it.id === this.offer.type)[0].title;
  }

  getCapitalLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].capital;
  }

  getConditionsLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].conditions;
  }

  getExperienceLabel(): string {
    return AppService.offerFieldsLabels[this.offer.type - 1].experience;
  }
}
