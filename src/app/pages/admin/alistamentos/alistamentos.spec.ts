import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Alistamentos } from './alistamentos';

describe('Alistamentos', () => {
  let component: Alistamentos;
  let fixture: ComponentFixture<Alistamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alistamentos],
    }).compileComponents();

    fixture = TestBed.createComponent(Alistamentos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
