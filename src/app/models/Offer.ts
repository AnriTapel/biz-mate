import {OfferTypes} from "./OfferTypes";

export interface Offer {
  userId?: string;
  offerId?: string;
  displayName: string;
  city: number;
  type: OfferTypes;
  businessArea: number;
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
