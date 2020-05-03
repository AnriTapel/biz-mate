import {Component, Input, OnInit} from '@angular/core';
import {Offer} from "../../models/Offer";
import {AppService} from "../../app.service";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-offer-card',
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.scss']
})
export class OfferCardComponent implements OnInit {

  @Input() offer: Offer;
  editable: boolean;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.editable = this.auth.user && this.auth.user.uid === this.offer.userId;
  }

  getOfferDate(offer: Offer): string {
    return AppService.getOfferDate(offer);
  }

  openOfferPage(offer: Offer): void {
    window.open(`/offer/${offer.offerId}`, '_blank');
  }

  editOffer(): void {
    this.router.navigateByUrl(`/edit-offer/${this.offer.offerId}`);
  }

}
