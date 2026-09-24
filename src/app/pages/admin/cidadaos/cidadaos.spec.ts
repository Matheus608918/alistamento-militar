import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cidadaos } from './cidadaos';

describe('Cidadaos', () => {
  let component: Cidadaos;
  let fixture: ComponentFixture<Cidadaos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cidadaos],
    }).compileComponents();

    fixture = TestBed.createComponent(Cidadaos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
