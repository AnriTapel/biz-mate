import { TestBed } from '@angular/core/testing';

import { UserSubscriptionsService } from './user-subscriptions.service';

describe('UserSubscriptionsService', () => {
  let service: UserSubscriptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSubscriptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
