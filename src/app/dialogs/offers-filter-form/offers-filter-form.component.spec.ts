import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OffersFilterFormComponent } from './offers-filter-form.component';

describe('OffersFilterFormComponent', () => {
  let component: OffersFilterFormComponent;
  let fixture: ComponentFixture<OffersFilterFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OffersFilterFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffersFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
