import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispenComponent } from './dispen.component';

describe('DispenComponent', () => {
  let component: DispenComponent;
  let fixture: ComponentFixture<DispenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DispenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
