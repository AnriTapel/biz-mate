import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOfferPageComponent } from './edit-offer-page.component';

describe('EditOfferPageComponent', () => {
  let component: EditOfferPageComponent;
  let fixture: ComponentFixture<EditOfferPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOfferPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOfferPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
