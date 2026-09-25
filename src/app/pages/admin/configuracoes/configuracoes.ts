import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService, mensagemErro } from '../../../services/api.service';
import { LocalApi, LocalRequest, TipoDocumentoApi } from '../../../models/api.models';
import { vazioParaNull } from '../../../shared/utils/formatadores';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.css'
})
export class Configuracoes implements OnInit {

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  erro = '';

  locais: LocalApi[] = [];

  local: LocalRequest = this.localVazio();

  idLocalEdicao: number | null = null;

  tipos: TipoDocumentoApi[] = [];

  tipo = { nomeTipo: '', descricao: '' };

  idTipoEdicao: number | null = null;

  ngOnInit(): void {
    this.carregar();
  }

  async carregar(): Promise<void> {

    try {

      const [locais, tipos] = await Promise.all([
        this.api.listarLocais(),
        this.api.listarTiposDocumento()
      ]);

      this.locais = locais;
      this.tipos = tipos;
      this.erro = '';

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar as configurações.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  async salvarLocal(): Promise<void> {

    const l = this.local;

    if (
      !l.nomeUnidade.trim() ||
      !l.enderecoLocal.trim() ||
      !l.cidadeLocal.trim() ||
      !l.estadoLocal.trim() ||
      !l.cepLocal.trim()
    ) {
      alert('Preencha todos os campos do local.');
      return;
    }

    const dto: LocalRequest = {
      nomeUnidade: l.nomeUnidade.trim(),
      enderecoLocal: l.enderecoLocal.trim(),
      cidadeLocal: l.cidadeLocal.trim(),
      estadoLocal: l.estadoLocal.trim().toUpperCase(),
      cepLocal: l.cepLocal.trim()
    };

    try {

      if (this.idLocalEdicao !== null) {
        await this.api.atualizarLocal(this.idLocalEdicao, dto);
      } else {
        await this.api.cadastrarLocal(dto);
      }

      this.cancelarLocal();

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível salvar o local.'));

    }

  }

  editarLocal(local: LocalApi): void {

    this.idLocalEdicao = local.id;

    this.local = {
      nomeUnidade: local.nomeUnidade,
      enderecoLocal: local.enderecoLocal,
      cidadeLocal: local.cidadeLocal,
      estadoLocal: local.estadoLocal,
      cepLocal: local.cepLocal
    };

  }

  cancelarLocal(): void {
    this.idLocalEdicao = null;
    this.local = this.localVazio();
  }

  async excluirLocal(local: LocalApi): Promise<void> {

    if (!confirm(`Excluir o local "${local.nomeUnidade}"?`)) {
      return;
    }

    try {

      await this.api.excluirLocal(local.id);

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível excluir. O local pode estar em uso por agendamentos ou avaliações.'));

    }

  }

  async salvarTipo(): Promise<void> {

    if (!this.tipo.nomeTipo.trim()) {
      alert('Informe o nome do tipo de documento.');
      return;
    }

    const dto = {
      nomeTipo: this.tipo.nomeTipo.trim(),
      descricao: vazioParaNull(this.tipo.descricao)
    };

    try {

      if (this.idTipoEdicao !== null) {
        await this.api.atualizarTipoDocumento(this.idTipoEdicao, dto);
      } else {
        await this.api.cadastrarTipoDocumento(dto);
      }

      this.cancelarTipo();

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível salvar o tipo de documento.'));

    }

  }

  editarTipo(tipo: TipoDocumentoApi): void {

    this.idTipoEdicao = tipo.idTipoDocumento;

    this.tipo = {
      nomeTipo: tipo.nomeTipo,
      descricao: tipo.descricao ?? ''
    };

  }

  cancelarTipo(): void {
    this.idTipoEdicao = null;
    this.tipo = { nomeTipo: '', descricao: '' };
  }

  async excluirTipo(tipo: TipoDocumentoApi): Promise<void> {

    if (!confirm(`Excluir o tipo "${tipo.nomeTipo}"?`)) {
      return;
    }

    try {

      await this.api.excluirTipoDocumento(tipo.idTipoDocumento);

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível excluir. Existem documentos deste tipo.'));

    }

  }

  async criarTiposPadrao(): Promise<void> {

    const padrao = [
      { nomeTipo: 'RG', descricao: 'Registro Geral' },
      { nomeTipo: 'CPF', descricao: 'Cadastro de Pessoa Física' },
      { nomeTipo: 'Certidão de Nascimento', descricao: null },
      { nomeTipo: 'Comprovante de Residência', descricao: null },
      { nomeTipo: 'Certificado de Escolaridade', descricao: null }
    ];

    const existentes = this.tipos.map(t => t.nomeTipo.toLowerCase());

    try {

      for (const t of padrao) {
        if (!existentes.includes(t.nomeTipo.toLowerCase())) {
          await this.api.cadastrarTipoDocumento(t);
        }
      }

      await this.carregar();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível criar os tipos padrão.'));

    }

  }

  private localVazio(): LocalRequest {
    return {
      nomeUnidade: '',
      enderecoLocal: '',
      cidadeLocal: '',
      estadoLocal: '',
      cepLocal: ''
    };
  }

}