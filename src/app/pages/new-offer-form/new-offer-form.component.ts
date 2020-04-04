import { Component, OnInit } from '@angular/core';
import {OfferTypes} from "../../models/OfferTypes";
import {AppService} from "../../app.service";

@Component({
  selector: 'app-new-offer-form',
  templateUrl: './new-offer-form.component.html',
  styleUrls: ['./new-offer-form.component.scss']
})
export class NewOfferFormComponent implements OnInit {

  private currentType: number;
  offerType = OfferTypes;
  constructor() {
  }

  ngOnInit(): void {
  }

  public setOfferType(type: OfferTypes): void{
    this.currentType = type;
  }

  public getOfferType(): OfferTypes {
    return this.currentType;
  }

  public getOfferTypesArray(): Array<any> {
    return AppService.offerTypes;
  }
}
