import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Documento } from '../../../models/documento.model';
import { Usuario } from '../../../models/usuario.model';

import { UsuarioService } from '../../../services/usuario.service';

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

  documentos: Documento[] = [];

  tipoDocumento = '';

  arquivoSelecionado: File | null = null;

  usuarioLogado: Usuario = {} as Usuario;

  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {

    const usuario = this.usuarioService.buscarUsuarioLogado();

    if (usuario) {

      this.usuarioLogado = usuario;

      this.documentos = usuario.documentos || [];

    }

  }

  selecionarArquivo(event: any) {

    if (event.target.files.length > 0) {

      this.arquivoSelecionado = event.target.files[0];

    }

  }

  enviarDocumento() {

    if (!this.tipoDocumento) {

      alert('Selecione o tipo do documento.');
      return;

    }

    if (!this.arquivoSelecionado) {

      alert('Selecione um arquivo.');
      return;

    }

    const novoDocumento: Documento = {

      tipo: this.tipoDocumento,

      nomeArquivo: this.arquivoSelecionado.name,

      dataEnvio: new Date().toLocaleDateString('pt-BR'),

      status: 'Em análise'

    };

    this.documentos.push(novoDocumento);

    this.usuarioLogado.documentos = this.documentos;

    this.usuarioService.atualizarUsuario(this.usuarioLogado);

    this.tipoDocumento = '';

    this.arquivoSelecionado = null;

    alert('Documento enviado com sucesso.');

  }

  excluirDocumento(index: number) {

    this.documentos.splice(index, 1);

    this.usuarioLogado.documentos = this.documentos;

    this.usuarioService.atualizarUsuario(this.usuarioLogado);

  }

}