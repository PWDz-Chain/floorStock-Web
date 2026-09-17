import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvsComponent } from './invs.component';

describe('InvsComponent', () => {
  let component: InvsComponent;
  let fixture: ComponentFixture<InvsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
