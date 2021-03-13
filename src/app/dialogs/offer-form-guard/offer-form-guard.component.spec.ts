import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferFormGuardComponent } from './offer-form-guard.component';

describe('OfferFormGuardComponent', () => {
  let component: OfferFormGuardComponent;
  let fixture: ComponentFixture<OfferFormGuardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfferFormGuardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferFormGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
