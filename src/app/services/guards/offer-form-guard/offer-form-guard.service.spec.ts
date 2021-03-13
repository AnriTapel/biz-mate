import { TestBed } from '@angular/core/testing';

import { OfferFormGuardService } from './offer-form-guard.service';

describe('OfferFormGuardService', () => {
  let service: OfferFormGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferFormGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
