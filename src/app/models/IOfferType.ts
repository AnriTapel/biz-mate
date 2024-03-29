export interface OfferType {
  id: number;
  title: string;
}

export enum OfferTypesEnum {
  NEED_INVESTMENTS = 1,
  HAVE_INVESTMENTS = 2,
  NEED_PARTNER = 3,
  SEARCH_BUSINESS = 4,
  SELL_BUSINESS = 5
}
