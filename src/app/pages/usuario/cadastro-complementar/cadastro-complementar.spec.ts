import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroComplementar } from './cadastro-complementar';

describe('CadastroComplementar', () => {
  let component: CadastroComplementar;
  let fixture: ComponentFixture<CadastroComplementar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroComplementar],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroComplementar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
