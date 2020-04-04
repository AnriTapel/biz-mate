import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedPartnerFormComponent } from './need-partner-form.component';

describe('NeedPartnerFormComponent', () => {
  let component: NeedPartnerFormComponent;
  let fixture: ComponentFixture<NeedPartnerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeedPartnerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedPartnerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
