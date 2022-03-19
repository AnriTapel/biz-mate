import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OffersPageComponent } from './offers-page.component';

describe('OffersPageComponent', () => {
  let component: OffersPageComponent;
  let fixture: ComponentFixture<OffersPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OffersPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
