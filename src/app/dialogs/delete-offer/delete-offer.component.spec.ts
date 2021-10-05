import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteOfferComponent } from './delete-offer.component';

describe('DeleteOfferComponent', () => {
  let component: DeleteOfferComponent;
  let fixture: ComponentFixture<DeleteOfferComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
