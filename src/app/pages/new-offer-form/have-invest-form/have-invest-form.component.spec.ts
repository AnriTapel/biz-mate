import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HaveInvestFormComponent } from './have-invest-form.component';

describe('HaveInvestFormComponent', () => {
  let component: HaveInvestFormComponent;
  let fixture: ComponentFixture<HaveInvestFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaveInvestFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaveInvestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
