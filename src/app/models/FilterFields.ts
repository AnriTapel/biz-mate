export interface FilterField {
  name: FilterFieldName;
  operator: FilterFieldOperator;
  value: any;
}

export enum FilterFieldName{
  BUSINESS_AREA = 'businessArea',
  OFFER_TYPE = 'type',
  CITY = 'city'
}

export enum FilterFieldOperator{
  EQUALS = '==',
  INCLUDES = 'array-contains',
  INCLUDES_ANY = 'array-contains-any'
}
