import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth';
import { ProcessoService } from '../../../services/processo.service';
import { StatusAlistamento, StatusDocumento } from '../../../shared/enums/perfil.enum';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class Status implements OnInit {

  private auth = inject(AuthService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  cadastro = 'Concluído';
  cadastroComplementar = 'Concluído';
  documentos = 'Pendente';
  analise = 'Aguardando documentos';
  avaliacao = 'Aguardando';
  resultado = 'Pendente';

  async ngOnInit(): Promise<void> {

    const sessao = this.auth.usuarioAtual();

    if (!sessao) {
      return;
    }

    try {

      const processo = await this.processoService.carregarDoUsuario(sessao.id);
      const status = processo.status;

      const statusDocs = this.processoService.statusDocumentos(processo);

      this.documentos =
        statusDocs === StatusDocumento.APROVADO ? 'Aprovados' :
        statusDocs === StatusDocumento.REPROVADO ? 'Reprovados' :
        statusDocs;

      if (status === StatusAlistamento.EM_ANALISE) {
        this.analise = 'Em análise';
      } else if (status === StatusAlistamento.DOCUMENTOS_REPROVADOS) {
        this.analise = 'Documentação reprovada';
      } else if (statusDocs === StatusDocumento.APROVADO) {
        this.analise = 'Concluída';
      }

      if (processo.avaliacao) {
        this.avaliacao = 'Concluída';
      } else if (processo.agendamento) {
        this.avaliacao = 'Agendada';
      }

      if (
        status === StatusAlistamento.APROVADO ||
        status === StatusAlistamento.REPROVADO
      ) {
        this.resultado = status;
      } else if (processo.avaliacao) {
        this.resultado = `Aguardando parecer (avaliação: ${processo.avaliacao.resultado})`;
      }

    } catch (erro) {

      console.error(erro);

    } finally {

      this.cdr.markForCheck();

    }

  }

}