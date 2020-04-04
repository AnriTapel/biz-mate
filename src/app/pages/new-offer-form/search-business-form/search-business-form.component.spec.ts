import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBusinessFormComponent } from './search-business-form.component';

describe('SearchBusinessFormComponent', () => {
  let component: SearchBusinessFormComponent;
  let fixture: ComponentFixture<SearchBusinessFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchBusinessFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBusinessFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
