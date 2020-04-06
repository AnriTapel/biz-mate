import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {NewOffer} from "../../models/NewOffer";
import {AppService} from "../../app.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss']
})
export class OfferCardComponent implements OnInit {

  @Input() offer: NewOffer;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  getOfferDate(offer: NewOffer): string {
    return AppService.getOfferDate(offer);
  }

  openOfferPage(offer: NewOffer): void {
    this.router.navigateByUrl(`/offer/${offer.offer_id}`);
  }

}
