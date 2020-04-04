import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedInvestFormComponent } from './need-invest-form.component';

describe('NeedInvestFormComponent', () => {
  let component: NeedInvestFormComponent;
  let fixture: ComponentFixture<NeedInvestFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeedInvestFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedInvestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
