import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HitDispenseComponent } from './hit-dispense.component';

describe('HitDispenseComponent', () => {
  let component: HitDispenseComponent;
  let fixture: ComponentFixture<HitDispenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HitDispenseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HitDispenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
