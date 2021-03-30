import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersFilterFormComponent } from './offers-filter-form.component';

describe('OffersFilterFormComponent', () => {
  let component: OffersFilterFormComponent;
  let fixture: ComponentFixture<OffersFilterFormComponent>;

  beforeEach(async(() => {
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
