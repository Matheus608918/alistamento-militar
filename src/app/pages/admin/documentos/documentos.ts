import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { mensagemErro } from '../../../services/api.service';
import { Processo, ProcessoService } from '../../../services/processo.service';
import { StatusAlistamento, StatusDocumento } from '../../../shared/enums/perfil.enum';
import { formatarData } from '../../../shared/utils/formatadores';

interface LinhaDocumento {
  usuario: string;
  cpf: string;
  tipo: string;
  numero: string;
  nomeArquivo: string;
  dataEnvio: string;
  status: string;
  processo: Processo;
}

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css'
})
export class Documentos implements OnInit {

  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  documentos: LinhaDocumento[] = [];

  erro = '';

  ngOnInit(): void {
    this.carregarDocumentos();
  }

  async carregarDocumentos(): Promise<void> {

    try {

      const processos = await this.processoService.carregarTodos();

      this.documentos = [];

      processos.forEach(processo => {

        const status = this.processoService.statusDocumentos(processo);

        processo.documentos.forEach(documento => {

          this.documentos.push({
            usuario: processo.usuario.nome,
            cpf: processo.usuario.cpf,
            tipo: documento.tipoDocumentoResponseDTO?.nomeTipo ?? '-',
            numero: documento.numeroDocumento,
            nomeArquivo: documento.nomeArquivo,
            dataEnvio: formatarData(documento.dataEnvio),
            status,
            processo
          });

        });

      });

      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar os documentos.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  async alterarStatus(documento: LinhaDocumento, status: string): Promise<void> {

    const alistamento = documento.processo.alistamento;

    if (!alistamento) {
      alert('Este cidadão não possui alistamento aberto.');
      return;
    }

    const aprovar = status === StatusDocumento.APROVADO;

    const pergunta = aprovar
      ? `Aprovar TODA a documentação de ${documento.usuario}?`
      : `Reprovar a documentação de ${documento.usuario}? Ele precisará reenviar os documentos.`;

    if (!confirm(pergunta)) {
      return;
    }

    try {

      await this.processoService.atualizarStatus(
        alistamento.id,
        aprovar
          ? StatusAlistamento.DOCUMENTOS_APROVADOS
          : StatusAlistamento.DOCUMENTOS_REPROVADOS
      );

      alert('Status da documentação atualizado com sucesso.');

      await this.carregarDocumentos();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível atualizar o status.'));

    }

  }

}