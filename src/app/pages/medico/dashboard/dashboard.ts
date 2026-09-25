import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { mensagemErro } from '../../../services/api.service';
import { AgendamentoView, CidadaoView, ProcessoService } from '../../../services/processo.service';

interface Paciente {
  nome: string;
  cpf: string;
  agendamento: AgendamentoView;
  idAlistamento: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private router = inject(Router);
  private auth = inject(AuthService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  medico = { nome: '' };

  avaliacoesHoje = 0;

  pendentes = 0;

  finalizadas = 0;

  pacientesHoje: Paciente[] = [];

  erro = '';

  ngOnInit(): void {

    this.medico.nome = this.auth.usuarioAtual()?.nome ?? '';

    this.carregarPacientes();

  }

  async carregarPacientes(): Promise<void> {

    const idMedico = this.auth.usuarioAtual()?.id;

    try {

      const processos = await this.processoService.carregarTodos();

      this.avaliacoesHoje = 0;
      this.pendentes = 0;
      this.finalizadas = 0;
      this.pacientesHoje = [];

      processos.forEach(processo => {

        if (!processo.agendamento || !processo.alistamento) {
          return;
        }

        this.avaliacoesHoje++;

        if (processo.avaliacao) {

          if (processo.avaliacao.medicoResponseDTO?.id === idMedico) {
            this.finalizadas++;
          }

          return;

        }

        const view: CidadaoView = this.processoService.paraView(processo);

        this.pendentes++;

        this.pacientesHoje.push({
          nome: view.nome,
          cpf: view.cpf,
          agendamento: view.agendamento as AgendamentoView,
          idAlistamento: processo.alistamento.id
        });

      });

      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar os pacientes.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  avaliar(paciente: Paciente): void {

    this.router.navigate(
      ['/medico/avaliacao'],
      { queryParams: { alistamento: paciente.idAlistamento } }
    );

  }

}