import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth';
import { mensagemErro } from '../../../services/api.service';
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
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  agendamento: AgendamentoView | null = null;

  erro = '';

  async ngOnInit(): Promise<void> {

    const sessao = this.auth.usuarioAtual();

    if (!sessao) {
      return;
    }

    try {

      const processo = await this.processoService.carregarDoUsuario(sessao.id);

      this.agendamento = this.processoService.paraView(processo).agendamento;

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar o agendamento.');

    } finally {

      this.cdr.markForCheck();

    }

  }

}