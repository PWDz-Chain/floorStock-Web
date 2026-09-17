import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HitstoryComponent } from './hitstory.component';

describe('HitstoryComponent', () => {
  let component: HitstoryComponent;
  let fixture: ComponentFixture<HitstoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HitstoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HitstoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
