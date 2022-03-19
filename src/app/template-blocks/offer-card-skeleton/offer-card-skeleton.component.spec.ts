import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OfferCardSkeletonComponent } from './offer-card-skeleton.component';

describe('OfferCardSkeletonComponent', () => {
  let component: OfferCardSkeletonComponent;
  let fixture: ComponentFixture<OfferCardSkeletonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OfferCardSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
