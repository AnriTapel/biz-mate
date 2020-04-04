import {OfferTypes} from "./OfferTypes";

export interface NewOffer {
  user_id?: string;
  offer_id?: string;
  name: string;
  city: number ;
  type: OfferTypes;
  business_areas: Array<number | string>;
  avatar_url?: string;
  date: Date | any;
  title: string;
  desc: string;
  capital?: Array<number>;
  conditions?: string;
  experience?: string;
  phone?: string;
  email?: string;
  profilePhoto?: string;
}
