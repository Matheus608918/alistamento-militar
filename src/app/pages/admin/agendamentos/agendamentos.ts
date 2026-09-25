import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService, mensagemErro } from '../../../services/api.service';
import { Processo, ProcessoService } from '../../../services/processo.service';
import { StatusAlistamento } from '../../../shared/enums/perfil.enum';

interface LinhaAgendamento {
  id: number;
  usuario: string;
  cpf: string;
  data: string;
  horario: string;
  local: string;
  medico: string;
  status: string;
  processo: Processo;
}

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendamentos.html',
  styleUrl: './agendamentos.css'
})
export class Agendamentos implements OnInit {

  private api = inject(ApiService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  agendamentos: LinhaAgendamento[] = [];

  erro = '';

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  async carregarAgendamentos(): Promise<void> {

    try {

      const processos = await this.processoService.carregarTodos();

      this.agendamentos = [];

      processos.forEach(processo => {

        const view = this.processoService.paraView(processo);

        if (view.agendamento) {

          this.agendamentos.push({
            id: view.agendamento.id,
            usuario: view.nome,
            cpf: view.cpf,
            data: view.agendamento.data,
            horario: view.agendamento.horario,
            local: view.agendamento.local,
            medico: view.agendamento.medico || '-',
            status: view.agendamento.status,
            processo
          });

        }

      });

      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar os agendamentos.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  async cancelar(agendamento: LinhaAgendamento): Promise<void> {

    if (!confirm(`Cancelar o agendamento de ${agendamento.usuario}?`)) {
      return;
    }

    try {

      await this.api.excluirAgendamento(agendamento.id);

      const alistamento = agendamento.processo.alistamento;

      if (alistamento) {
        await this.processoService.atualizarStatus(
          alistamento.id,
          StatusAlistamento.DOCUMENTOS_APROVADOS
        );
      }

      alert('Agendamento cancelado. O cidadão pode ser reagendado na tela de Cidadãos.');

      await this.carregarAgendamentos();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível cancelar o agendamento.'));

    }

  }

}