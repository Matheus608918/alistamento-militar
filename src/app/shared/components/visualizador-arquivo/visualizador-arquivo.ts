import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiService, mensagemErro } from '../../../services/api.service';
import { Modal } from '../modal/modal';

/*
 Janela que mostra o arquivo de um documento (imagem ou PDF).
 O arquivo é baixado da API com o token JWT e exibido sem sair da página.
 */
@Component({
  selector: 'app-visualizador-arquivo',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './visualizador-arquivo.html',
  styleUrl: './visualizador-arquivo.css'
})
export class VisualizadorArquivo implements OnChanges, OnDestroy {

  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  // Id do documento a exibir; null fecha a janela
  @Input() idDocumento: number | null = null;

  @Input() titulo = 'Documento';

  @Output() fechar = new EventEmitter<void>();

  carregando = false;
  erro = '';

  tipo: 'imagem' | 'pdf' | 'outro' | null = null;

  urlImagem = '';
  urlPdf: SafeResourceUrl | null = null;
  urlBaixar = '';

  private urlTemporaria: string | null = null;

  async ngOnChanges(): Promise<void> {

    this.limpar();

    if (this.idDocumento === null) {
      return;
    }

    this.carregando = true;
    this.cdr.markForCheck();

    try {

      const arquivo = await this.api.baixarArquivoDocumento(this.idDocumento);

      this.urlTemporaria = URL.createObjectURL(arquivo);
      this.urlBaixar = this.urlTemporaria;

      if (arquivo.type.startsWith('image/')) {
        this.tipo = 'imagem';
        this.urlImagem = this.urlTemporaria;
      } else if (arquivo.type === 'application/pdf') {
        this.tipo = 'pdf';
        this.urlPdf = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlTemporaria);
      } else {
        this.tipo = 'outro';
      }

    } catch (erro) {

      this.erro = erro instanceof HttpErrorResponse && erro.status === 404
        ? 'Nenhum arquivo foi enviado para este documento.'
        : mensagemErro(erro, 'Não foi possível abrir o arquivo.');

    } finally {

      this.carregando = false;
      this.cdr.markForCheck();

    }

  }

  ngOnDestroy(): void {
    this.limpar();
  }

  aoFechar(): void {
    this.limpar();
    this.fechar.emit();
  }

  // Libera a memória usada pelo arquivo baixado
  private limpar(): void {

    if (this.urlTemporaria) {
      URL.revokeObjectURL(this.urlTemporaria);
    }

    this.urlTemporaria = null;
    this.urlImagem = '';
    this.urlPdf = null;
    this.urlBaixar = '';
    this.tipo = null;
    this.erro = '';

  }

}