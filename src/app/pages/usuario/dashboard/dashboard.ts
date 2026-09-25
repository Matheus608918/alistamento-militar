import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth';
import { mensagemErro } from '../../../services/api.service';
import { AgendamentoView, ProcessoService } from '../../../services/processo.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private auth = inject(AuthService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  usuario = { nome: '' };

  carregando = true;

  erro = '';

  quantidadeDocumentos = 0;

  statusDocumentos = 'Pendente';

  statusAvaliacao = 'Pendente';

  status = 'Em análise';

  proximaEtapa = 'Aguardando análise da Junta Militar';

  dataCadastro = '';

  agendamento: AgendamentoView | null = null;

  async ngOnInit(): Promise<void> {

    const sessao = this.auth.usuarioAtual();

    if (!sessao) {
      return;
    }

    this.usuario.nome = sessao.nome;

    try {

      await this.processoService.garantirAlistamento(sessao.id);

      const processo = await this.processoService.carregarDoUsuario(sessao.id);
      const view = this.processoService.paraView(processo);

      this.usuario.nome = view.nome;
      this.quantidadeDocumentos = view.documentos.length;
      this.statusDocumentos = this.processoService.statusDocumentos(processo);
      this.status = view.status;
      this.proximaEtapa = this.processoService.proximaEtapa(view.status);
      this.dataCadastro = view.dataCadastro;
      this.agendamento = view.agendamento;
      this.statusAvaliacao = view.avaliacao
        ? 'Concluída'
        : view.agendamento ? 'Agendada' : 'Pendente';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar seu processo.');

    } finally {

      this.carregando = false;
      this.cdr.markForCheck();

    }

  }

}