import { TestBed } from '@angular/core/testing';

import { EventObserver } from './event-observer.service';

describe('EventObserverService', () => {
  let service: EventObserver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventObserver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
