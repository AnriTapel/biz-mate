import {OfferTypesEnum} from "./IOfferType";

export interface Offer {
  userId?: string;
  offerId?: string;
  displayName: string;
  city: number;
  type: OfferTypesEnum;
  businessArea: number[];
  date: number;
  title: string;
  desc: string;
  capital?: number;
  conditions?: string;
  experience?: string;
  phone?: string;
  email: string;
  photoURL?: string;
  contactMethods: any;
  imagesURL?: string[];
}
