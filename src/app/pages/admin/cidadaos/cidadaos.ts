import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

import {
  StatusAlistamento,
  StatusDocumento
} from '../../../shared/enums/perfil.enum';

import { Button } from '../../../shared/components/button/button';
import { Modal } from '../../../shared/components/modal/modal';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';

import { formatarCpf } from '../../../shared/utils/validadores';

@Component({
  selector: 'app-cidadaos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Modal,
    StatusBadge
  ],
  templateUrl: './cidadaos.html',
  styleUrl: './cidadaos.css'
})
export class Cidadaos implements OnInit {

  private usuarioService = inject(UsuarioService);

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  medicos: any[] = [];

  pesquisa = '';
  filtroStatus = 'Todos';

  usuarioSelecionado: Usuario | null = null;
  mostrarDetalhes = false;

  mostrarAgendamento = false;
  usuarioAgendamento: Usuario | null = null;

  medicoSelecionado = '';
  data = '';
  horario = '';
  local = '';

  readonly Status = StatusAlistamento;

  readonly opcoesStatus = Object.values(StatusAlistamento);

  ngOnInit(): void {
    this.carregarUsuarios();
    this.carregarMedicos();
  }

  carregarUsuarios(): void {
    this.usuarios = this.usuarioService.listarCidadaos();
    this.filtrar();
  }

  carregarMedicos(): void {

    try {

      this.medicos = JSON.parse(
        localStorage.getItem('medicos') || '[]'
      );

    } catch {

      this.medicos = [];

    }

  }

  filtrar(): void {

    const termo = this.pesquisa.trim().toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(usuario => {

      const casaPesquisa =
        !termo ||
        usuario.nome?.toLowerCase().includes(termo) ||
        usuario.cpf?.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));

      const status = usuario.status || StatusAlistamento.EM_ANALISE;

      const casaStatus =
        this.filtroStatus === 'Todos' ||
        status === this.filtroStatus;

      return casaPesquisa && casaStatus;

    });

  }

  exibirCpf(cpf?: string): string {
    return cpf ? formatarCpf(cpf) : '-';
  }

  documentosAprovados(usuario: Usuario): boolean {

    const docs = usuario.documentos ?? [];

    return (
      docs.length > 0 &&
      docs.every(doc => doc.status === StatusDocumento.APROVADO)
    );

  }

  temAgendamento(usuario: Usuario): boolean {
    return !!usuario.agendamento;
  }

  avaliacaoConcluida(usuario: Usuario): boolean {
    return !!usuario.avaliacao?.resultado;
  }

  jaDecidido(usuario: Usuario): boolean {

    return (
      usuario.status === StatusAlistamento.APROVADO ||
      usuario.status === StatusAlistamento.REPROVADO
    );

  }

  podeEmitirParecer(usuario: Usuario): boolean {

    return (
      this.documentosAprovados(usuario) &&
      this.temAgendamento(usuario) &&
      this.avaliacaoConcluida(usuario) &&
      !this.jaDecidido(usuario)
    );

  }

  motivoBloqueioParecer(usuario: Usuario): string {

    if (this.jaDecidido(usuario)) {
      return `Parecer já emitido: ${usuario.status}.`;
    }

    if (!this.documentosAprovados(usuario)) {
      return 'Todos os documentos precisam estar aprovados.';
    }

    if (!this.temAgendamento(usuario)) {
      return 'É necessário agendar a avaliação médica.';
    }

    if (!this.avaliacaoConcluida(usuario)) {
      return 'Aguardando o médico concluir a avaliação.';
    }

    return '';

  }

  podeAgendar(usuario: Usuario): boolean {

    return (
      this.documentosAprovados(usuario) &&
      !this.temAgendamento(usuario)
    );

  }

  motivoBloqueioAgendamento(usuario: Usuario): string {

    if (this.temAgendamento(usuario)) {
      return 'Este cidadão já possui avaliação agendada.';
    }

    if (!this.documentosAprovados(usuario)) {
      return 'Aprove todos os documentos antes de agendar.';
    }

    return '';

  }

  visualizar(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    this.mostrarDetalhes = true;
  }

  fecharDetalhes(): void {
    this.usuarioSelecionado = null;
    this.mostrarDetalhes = false;
  }

  aprovar(usuario: Usuario): void {

    if (!this.podeEmitirParecer(usuario)) {

      alert(this.motivoBloqueioParecer(usuario));

      return;

    }

    if (!confirm(`Confirmar parecer APTO para ${usuario.nome}?`)) {
      return;
    }

    usuario.status = StatusAlistamento.APROVADO;
    usuario.resultado = 'Apto ao Serviço Militar';

    this.salvar(usuario);

  }

  reprovar(usuario: Usuario): void {

    if (!this.podeEmitirParecer(usuario)) {

      alert(this.motivoBloqueioParecer(usuario));

      return;

    }

    if (!confirm(`Confirmar DISPENSA para ${usuario.nome}?`)) {
      return;
    }

    usuario.status = StatusAlistamento.REPROVADO;
    usuario.resultado = 'Dispensado do Serviço Militar';

    this.salvar(usuario);

  }

  excluir(usuario: Usuario): void {

    if (!confirm(`Excluir o cadastro de ${usuario.nome}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    this.usuarioService.excluirUsuario(usuario.email);

    this.fecharDetalhes();

    this.carregarUsuarios();

  }

  agendar(usuario: Usuario): void {

    if (!this.podeAgendar(usuario)) {

      alert(this.motivoBloqueioAgendamento(usuario));

      return;

    }

    this.usuarioAgendamento = usuario;

    this.limparCamposAgendamento();

    this.mostrarAgendamento = true;

  }

  fecharAgendamento(): void {
    this.usuarioAgendamento = null;
    this.mostrarAgendamento = false;
    this.limparCamposAgendamento();
  }

  private limparCamposAgendamento(): void {
    this.medicoSelecionado = '';
    this.data = '';
    this.horario = '';
    this.local = '';
  }

  get dataMinima(): string {
    return new Date().toISOString().split('T')[0];
  }

  confirmarAgendamento(): void {

    if (!this.usuarioAgendamento) {
      return;
    }

    if (
      !this.medicoSelecionado ||
      !this.data ||
      !this.horario ||
      !this.local.trim()
    ) {

      alert('Preencha todos os campos do agendamento.');

      return;

    }

    if (this.data < this.dataMinima) {

      alert('A data da avaliação não pode ser anterior a hoje.');

      return;

    }

    const usuario = this.usuarioAgendamento;

    usuario.agendamento = {
      data: this.data,
      horario: this.horario,
      local: this.local.trim(),
      medico: this.medicoSelecionado,
      status: 'Agendado',
      confirmado: false
    } as any;

    usuario.status = StatusAlistamento.AVALIACAO_AGENDADA;

    this.usuarioService.atualizarUsuario(usuario);

    alert('Avaliação médica agendada com sucesso.');

    this.fecharAgendamento();

    this.carregarUsuarios();

  }

  private salvar(usuario: Usuario): void {

    this.usuarioService.atualizarUsuario(usuario);

    this.carregarUsuarios();

  }

}