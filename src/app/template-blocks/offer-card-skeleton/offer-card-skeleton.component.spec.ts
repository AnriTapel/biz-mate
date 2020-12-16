import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferCardSkeletonComponent } from './offer-card-skeleton.component';

describe('OfferCardSkeletonComponent', () => {
  let component: OfferCardSkeletonComponent;
  let fixture: ComponentFixture<OfferCardSkeletonComponent>;

  beforeEach(async(() => {
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
