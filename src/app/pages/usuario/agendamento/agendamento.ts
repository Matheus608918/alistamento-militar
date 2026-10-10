import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth';
import { ApiService, mensagemErro } from '../../../services/api.service';
import { AgendamentoView, ProcessoService } from '../../../services/processo.service';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendamento.html',
  styleUrl: './agendamento.css'
})
export class Agendamento implements OnInit {

  private auth = inject(AuthService);
  private api = inject(ApiService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  agendamento: AgendamentoView | null = null;

  avaliacaoConcluida = false;

  confirmando = false;

  erro = '';

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {

    const sessao = this.auth.usuarioAtual();

    if (!sessao) {
      return;
    }

    try {

      const processo = await this.processoService.carregarDoUsuario(sessao.id);

      this.agendamento = this.processoService.paraView(processo).agendamento;
      this.avaliacaoConcluida = !!processo.avaliacao;
      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar o agendamento.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  get podeConfirmar(): boolean {
    return !!this.agendamento && !this.agendamento.confirmado && !this.avaliacaoConcluida;
  }

  async confirmarPresenca(): Promise<void> {

    if (!this.agendamento || !this.podeConfirmar) {
      return;
    }

    if (!confirm(`Confirmar sua presença em ${this.agendamento.data} às ${this.agendamento.horario}?`)) {
      return;
    }

    this.confirmando = true;
    this.cdr.markForCheck();

    try {

      await this.api.confirmarPresenca(this.agendamento.id);

      alert('Presença confirmada com sucesso!');

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível confirmar a presença.'));

    } finally {

      this.confirmando = false;
      this.cdr.markForCheck();

    }

  }

}