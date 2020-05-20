import { TestBed } from '@angular/core/testing';

import { NotificationBarService } from './notification-bar.service';

describe('NotificationBarService', () => {
  let service: NotificationBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
