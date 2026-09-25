import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { ProcessoService } from '../../../services/processo.service';
import { StatusAlistamento } from '../../../shared/enums/perfil.enum';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultado.html',
  styleUrl: './resultado.css'
})
export class Resultado implements OnInit {

  private router = inject(Router);
  private auth = inject(AuthService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  nomeUsuario = '';

  dataCadastro = '';

  situacao: string = StatusAlistamento.EM_ANALISE;

  proximaEtapa = 'Aguardando análise da Junta Militar';

  get classeSituacao(): string {

    switch (this.situacao) {
      case StatusAlistamento.APROVADO: return 'aprovado';
      case StatusAlistamento.REPROVADO: return 'reprovado';
      default: return 'analise';
    }

  }

  async ngOnInit(): Promise<void> {

    const sessao = this.auth.usuarioAtual();

    if (!sessao) {
      return;
    }

    this.nomeUsuario = sessao.nome || 'Usuário';

    try {

      const processo = await this.processoService.carregarDoUsuario(sessao.id);
      const view = this.processoService.paraView(processo);

      this.nomeUsuario = view.nome || 'Usuário';
      this.dataCadastro = view.dataCadastro;
      this.situacao = view.status;
      this.proximaEtapa = this.processoService.proximaEtapa(view.status);

    } catch (erro) {

      console.error(erro);

    } finally {

      this.cdr.markForCheck();

    }

  }

  voltarDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}