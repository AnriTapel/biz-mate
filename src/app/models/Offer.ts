import {OfferTypes} from "./OfferTypes";

export interface Offer {
  userId?: string;
  offerId?: string;
  name: string;
  city: number ;
  type: OfferTypes;
  businessArea: number;
  date: number;
  title: string;
  desc: string;
  capital?: Array<number>;
  conditions?: string;
  experience?: string;
  phone?: string;
  email?: string;
  profilePhoto?: string;
}
