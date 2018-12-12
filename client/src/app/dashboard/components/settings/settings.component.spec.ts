import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: DashboardSettingsComponent;
  let fixture: ComponentFixture<DashboardSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
