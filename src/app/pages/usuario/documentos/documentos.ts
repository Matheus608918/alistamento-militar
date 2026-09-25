import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth';
import { ApiService, mensagemErro } from '../../../services/api.service';
import { DocumentoView, Processo, ProcessoService } from '../../../services/processo.service';
import { TipoDocumentoApi } from '../../../models/api.models';
import { StatusAlistamento } from '../../../shared/enums/perfil.enum';
import { agoraIso, hojeIso, vazioParaNull } from '../../../shared/utils/formatadores';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css'
})
export class Documentos implements OnInit {

  private auth = inject(AuthService);
  private api = inject(ApiService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  processo: Processo | null = null;

  documentos: DocumentoView[] = [];

  tipos: TipoDocumentoApi[] = [];

  podeEnviar = false;

  enviando = false;

  erro = '';

  readonly dataMaxima = hojeIso();

  tipoDocumento: number | null = null;
  numeroDocumento = '';
  numeroFolha = '';
  numeroLivro = '';
  dataEmissao = '';
  orgaoEmissor = '';
  cidadeEmissao = '';
  estadoEmissao = '';

  arquivoSelecionado: File | null = null;

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {

    const sessao = this.auth.usuarioAtual();

    if (!sessao) {
      return;
    }

    try {

      await this.processoService.garantirAlistamento(sessao.id);

      const [processo, tipos] = await Promise.all([
        this.processoService.carregarDoUsuario(sessao.id),
        this.api.listarTiposDocumento()
      ]);

      this.processo = processo;
      this.tipos = tipos;
      this.documentos = this.processoService.paraView(processo).documentos;
      this.podeEnviar = this.processoService.podeEnviarDocumentos(processo);
      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar seus documentos.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  selecionarArquivo(event: Event) {

    const input = event.target as HTMLInputElement;

    this.arquivoSelecionado = input.files && input.files.length > 0
      ? input.files[0]
      : null;

  }

  async enviarDocumento(): Promise<void> {

    const processo = this.processo;

    if (!processo?.alistamento) {
      alert('Seu alistamento ainda não foi aberto.');
      return;
    }

    if (!this.tipoDocumento) {
      alert('Selecione o tipo do documento.');
      return;
    }

    if (
      !this.numeroDocumento.trim() ||
      !this.dataEmissao ||
      !this.orgaoEmissor.trim() ||
      !this.cidadeEmissao.trim() ||
      !this.estadoEmissao.trim()
    ) {
      alert('Preencha número, data de emissão, órgão emissor, cidade e estado de emissão.');
      return;
    }

    if (!this.arquivoSelecionado) {
      alert('Selecione um arquivo.');
      return;
    }

    this.enviando = true;
    this.cdr.markForCheck();

    try {

      await this.api.cadastrarDocumento({
        numeroDocumento: this.numeroDocumento.trim(),
        numeroFolha: vazioParaNull(this.numeroFolha),
        numeroLivro: vazioParaNull(this.numeroLivro),
        dataEmissao: this.dataEmissao,
        orgaoEmissor: this.orgaoEmissor.trim(),
        cidadeEmissao: this.cidadeEmissao.trim(),
        estadoEmissao: this.estadoEmissao.trim(),
        nomeArquivo: this.arquivoSelecionado.name.substring(0, 100),
        dataEnvio: agoraIso(),
        idUsuario: processo.usuario.id,
        idAlistamento: processo.alistamento.id,
        idTipoDocumento: this.tipoDocumento
      });

      if (
        processo.status === StatusAlistamento.AGUARDANDO_DOCUMENTOS ||
        processo.status === StatusAlistamento.DOCUMENTOS_REPROVADOS ||
        processo.status === StatusAlistamento.CADASTRO_INCOMPLETO
      ) {
        await this.processoService.atualizarStatus(
          processo.alistamento.id,
          StatusAlistamento.EM_ANALISE
        );
      }

      this.limparFormulario();

      alert('Documento enviado com sucesso.');

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível enviar o documento.'));

    } finally {

      this.enviando = false;
      this.cdr.markForCheck();

    }

  }

  async excluirDocumento(documento: DocumentoView): Promise<void> {

    if (!this.podeEnviar) {
      alert('A documentação já foi aprovada e não pode mais ser alterada.');
      return;
    }

    if (!confirm(`Excluir o documento "${documento.tipo}"?`)) {
      return;
    }

    try {

      await this.api.excluirDocumento(documento.id);

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível excluir o documento.'));

    }

  }

  private limparFormulario(): void {

    this.tipoDocumento = null;
    this.numeroDocumento = '';
    this.numeroFolha = '';
    this.numeroLivro = '';
    this.dataEmissao = '';
    this.orgaoEmissor = '';
    this.cidadeEmissao = '';
    this.estadoEmissao = '';
    this.arquivoSelecionado = null;

  }

}