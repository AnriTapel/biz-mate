import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOfferFormComponent } from './new-offer-form.component';

describe('NewOfferFormComponent', () => {
  let component: NewOfferFormComponent;
  let fixture: ComponentFixture<NewOfferFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewOfferFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewOfferFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
