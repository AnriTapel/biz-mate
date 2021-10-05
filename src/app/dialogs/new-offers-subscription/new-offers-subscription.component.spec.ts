import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewOffersSubscriptionComponent } from './new-offers-subscription.component';

describe('NewOffersSubscriptionComponent', () => {
  let component: NewOffersSubscriptionComponent;
  let fixture: ComponentFixture<NewOffersSubscriptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewOffersSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOffersSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
