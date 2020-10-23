export interface FilterField {
  name: FilterFieldName;
  operator: FilterFieldOperator;
  value: any;
}

export enum FilterFieldName{
  BUSINESS_AREA = 'businessArea',
  OFFER_TYPE = 'offerType',
  CITY = 'city'
}

export enum FilterFieldOperator{
  EQUALS = '==',
  INCLUDES = 'array-contains'
}
