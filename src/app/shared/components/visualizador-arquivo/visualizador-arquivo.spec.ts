import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizadorArquivo } from './visualizador-arquivo';

describe('VisualizadorArquivo', () => {
  let component: VisualizadorArquivo;
  let fixture: ComponentFixture<VisualizadorArquivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizadorArquivo],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizadorArquivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
