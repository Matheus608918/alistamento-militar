import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../../services/api.service';
import { ProcessoService } from '../../../services/processo.service';
import { StatusAlistamento } from '../../../shared/enums/perfil.enum';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css'
})
export class Relatorios implements OnInit {

  private api = inject(ApiService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  totalUsuarios = 0;
  totalMedicos = 0;
  totalDocumentos = 0;
  totalAgendamentos = 0;
  totalAvaliacoes = 0;

  aprovados = 0;
  reprovados = 0;
  emAnalise = 0;

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  async carregarRelatorio(): Promise<void> {

    try {

      const [processos, medicos] = await Promise.all([
        this.processoService.carregarTodos(),
        this.api.listarMedicos()
      ]);

      this.totalUsuarios = processos.length;
      this.totalMedicos = medicos.length;

      this.totalDocumentos = 0;
      this.totalAgendamentos = 0;
      this.totalAvaliacoes = 0;

      this.aprovados = 0;
      this.reprovados = 0;
      this.emAnalise = 0;

      processos.forEach(processo => {

        this.totalDocumentos += processo.documentos.length;

        if (processo.agendamento) {
          this.totalAgendamentos++;
        }

        if (processo.avaliacao) {
          this.totalAvaliacoes++;
        }

        switch (processo.status) {

          case StatusAlistamento.APROVADO:
            this.aprovados++;
            break;

          case StatusAlistamento.REPROVADO:
            this.reprovados++;
            break;

          default:
            this.emAnalise++;
            break;

        }

      });

    } catch (erro) {

      console.error(erro);

    } finally {

      this.cdr.markForCheck();

    }

  }

  exportarRelatorio(): void {

    const relatorio = `
===== RELATÓRIO DO SISTEMA =====

Cidadãos: ${this.totalUsuarios}
Médicos: ${this.totalMedicos}

Documentos: ${this.totalDocumentos}
Agendamentos: ${this.totalAgendamentos}
Avaliações: ${this.totalAvaliacoes}

Aprovados: ${this.aprovados}
Reprovados: ${this.reprovados}
Em análise: ${this.emAnalise}
`;

    const blob = new Blob(
      [relatorio],
      { type: 'text/plain;charset=utf-8' }
    );

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);

    link.download = 'relatorio.txt';

    link.click();

    URL.revokeObjectURL(link.href);

  }

}