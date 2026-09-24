import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css'
})
export class ProgressBar {

  @Input() etapaAtual = 0;

  @Input() totalEtapas = 1;

  @Input() rotulo = 'Progresso do alistamento';

  @Input() mostrarTexto = true;

  get percentual(): number {

    if (this.totalEtapas <= 0) {
      return 0;
    }

    const bruto = (this.etapaAtual / this.totalEtapas) * 100;

    return Math.min(100, Math.max(0, Math.round(bruto)));

  }

}