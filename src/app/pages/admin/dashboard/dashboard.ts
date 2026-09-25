import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService, mensagemErro } from '../../../services/api.service';
import { AgendamentoView, CidadaoView, ProcessoService } from '../../../services/processo.service';
import { StatusAlistamento } from '../../../shared/enums/perfil.enum';

interface LinhaAgendamento {
  nome: string;
  agendamento: AgendamentoView;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private api = inject(ApiService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: CidadaoView[] = [];

  ultimosUsuarios: CidadaoView[] = [];
  ultimosAgendamentos: LinhaAgendamento[] = [];

  totalUsuarios = 0;
  totalMedicos = 0;
  totalDocumentos = 0;
  totalAgendamentos = 0;
  totalAvaliacoes = 0;

  aprovados = 0;
  reprovados = 0;
  emAnalise = 0;

  erro = '';

  ngOnInit(): void {
    this.carregarInformacoes();
  }

  async carregarInformacoes(): Promise<void> {

    try {

      const [processos, medicos] = await Promise.all([
        this.processoService.carregarTodos(),
        this.api.listarMedicos()
      ]);

      this.usuarios = processos.map(p => this.processoService.paraView(p));

      this.totalUsuarios = this.usuarios.length;
      this.totalMedicos = medicos.length;

      this.totalDocumentos = 0;
      this.totalAgendamentos = 0;
      this.totalAvaliacoes = 0;

      this.aprovados = 0;
      this.reprovados = 0;
      this.emAnalise = 0;

      this.usuarios.forEach(usuario => {

        this.totalDocumentos += usuario.documentos.length;

        if (usuario.agendamento) {
          this.totalAgendamentos++;
        }

        if (usuario.avaliacao) {
          this.totalAvaliacoes++;
        }

        switch (usuario.status) {

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

      this.ultimosUsuarios = [...this.usuarios]
        .reverse()
        .slice(0, 5);

      this.ultimosAgendamentos = this.usuarios
        .filter(usuario => usuario.agendamento)
        .map(usuario => ({ nome: usuario.nome, agendamento: usuario.agendamento as AgendamentoView }))
        .reverse()
        .slice(0, 5);

      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar o painel.');

    } finally {

      this.cdr.markForCheck();

    }

  }

}