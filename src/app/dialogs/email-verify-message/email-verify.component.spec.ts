import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmailVerifyComponent } from './email-verify.component';

describe('EmailVerifyComponent', () => {
  let component: EmailVerifyComponent;
  let fixture: ComponentFixture<EmailVerifyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailVerifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
