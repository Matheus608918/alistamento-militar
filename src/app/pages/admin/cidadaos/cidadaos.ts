import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService, mensagemErro } from '../../../services/api.service';
import { AuthService } from '../../../services/auth';
import { CidadaoView, ProcessoService } from '../../../services/processo.service';
import { LocalApi, MedicoApi, PedidoSenhaApi } from '../../../models/api.models';

import {
  StatusAlistamento,
  StatusDocumento
} from '../../../shared/enums/perfil.enum';

import { Button } from '../../../shared/components/button/button';
import { Modal } from '../../../shared/components/modal/modal';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';

import { formatarCpf, mascararCpf } from '../../../shared/utils/validadores';
import { formatarData, hojeIso, horaParaApi } from '../../../shared/utils/formatadores';

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

  // LGPD: na lista o CPF aparece mascarado; completo só nos detalhes
  readonly mascararCpf = mascararCpf;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private processoService = inject(ProcessoService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: CidadaoView[] = [];
  usuariosFiltrados: CidadaoView[] = [];

  locais: LocalApi[] = [];

  medicos: MedicoApi[] = [];

  pesquisa = '';
  filtroStatus = 'Todos';
  filtroSexo = 'Todos';

  usuarioSelecionado: CidadaoView | null = null;
  mostrarDetalhes = false;

  mostrarAgendamento = false;
  usuarioAgendamento: CidadaoView | null = null;

  localSelecionado: number | null = null;
  medicoSelecionado: number | null = null;
  data = '';
  horario = '';

  salvando = false;

  erro = '';

  // ----- Recuperação de senha -----

  pedidosSenha: PedidoSenhaApi[] = [];

  mostrarSenha = false;
  usuarioSenha: CidadaoView | null = null;
  pedidoEmAtendimento: PedidoSenhaApi | null = null;

  novaSenha = '';
  confirmarNovaSenha = '';
  erroSenha = '';
  salvandoSenha = false;

  readonly formatarData = formatarData;

  readonly Status = StatusAlistamento;

  readonly opcoesStatus = Object.values(StatusAlistamento);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.carregarUsuarios(),
      this.carregarLocais(),
      this.carregarMedicos(),
      this.carregarPedidosSenha()
    ]);
  }

  async carregarUsuarios(): Promise<void> {

    try {

      const processos = await this.processoService.carregarTodos();

      this.usuarios = processos.map(p => this.processoService.paraView(p));
      this.erro = '';

      if (this.usuarioSelecionado) {
        const id = this.usuarioSelecionado.id;
        this.usuarioSelecionado = this.usuarios.find(u => u.id === id) ?? null;
        this.mostrarDetalhes = !!this.usuarioSelecionado;
      }

      this.filtrar();

    } catch (erro) {

      this.erro = mensagemErro(erro, 'Não foi possível carregar os cidadãos.');

    } finally {

      this.cdr.markForCheck();

    }

  }

  async carregarLocais(): Promise<void> {

    try {
      this.locais = await this.api.listarLocais();
    } catch {
      this.locais = [];
    } finally {
      this.cdr.markForCheck();
    }

  }

  async carregarMedicos(): Promise<void> {

    try {
      this.medicos = await this.api.listarMedicos();
    } catch {
      this.medicos = [];
    } finally {
      this.cdr.markForCheck();
    }

  }

  // Se a API ainda não tiver os pedidos de senha, a seção simplesmente não aparece
  async carregarPedidosSenha(): Promise<void> {

    try {
      const pedidos = await this.api.listarPedidosSenha();
      this.pedidosSenha = pedidos.filter(p => !p.status || p.status.toUpperCase() === 'PENDENTE');
    } catch {
      this.pedidosSenha = [];
    } finally {
      this.cdr.markForCheck();
    }

  }

  atenderPedido(pedido: PedidoSenhaApi): void {

    const email = pedido.email.trim().toLowerCase();
    const cidadao = this.usuarios.find(u => u.email?.toLowerCase() === email);

    if (cidadao) {
      this.abrirRedefinirSenha(cidadao, pedido);
      return;
    }

    if (this.medicos.some(m => m.emailMedico?.toLowerCase() === email)) {
      alert('Este e-mail é de um médico. Redefina a senha na tela Médicos, editando o cadastro dele.');
      return;
    }

    if (confirm('Nenhum cadastro usa este e-mail. Deseja marcar o pedido como atendido?')) {
      this.concluirPedido(pedido);
    }

  }

  abrirRedefinirSenha(usuario: CidadaoView, pedido: PedidoSenhaApi | null = null): void {

    this.usuarioSenha = usuario;
    this.pedidoEmAtendimento = pedido;
    this.novaSenha = '';
    this.confirmarNovaSenha = '';
    this.erroSenha = '';
    this.mostrarSenha = true;

  }

  fecharRedefinirSenha(): void {

    this.mostrarSenha = false;
    this.usuarioSenha = null;
    this.pedidoEmAtendimento = null;
    this.novaSenha = '';
    this.confirmarNovaSenha = '';

  }

  // Senha temporária de 8 caracteres, sem letras parecidas (0/O, 1/l)
  gerarSenhaTemporaria(): void {

    const caracteres = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const valores = new Uint32Array(8);

    crypto.getRandomValues(valores);

    const senha = Array.from(valores, v => caracteres[v % caracteres.length]).join('');

    this.novaSenha = senha;
    this.confirmarNovaSenha = senha;
    this.erroSenha = '';

  }

  async salvarNovaSenha(): Promise<void> {

    this.erroSenha = '';

    if (!this.usuarioSenha) {
      return;
    }

    if (this.novaSenha.length < 6) {
      this.erroSenha = 'A senha precisa ter pelo menos 6 caracteres.';
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.erroSenha = 'As senhas não coincidem.';
      return;
    }

    this.salvandoSenha = true;
    this.cdr.markForCheck();

    try {

      await this.api.redefinirSenhaUsuario(this.usuarioSenha.id, this.novaSenha);

      if (this.pedidoEmAtendimento) {
        await this.concluirPedido(this.pedidoEmAtendimento);
      }

      alert(
        `Senha de ${this.usuarioSenha.nome} redefinida.\n\n` +
        `Nova senha: ${this.novaSenha}\n\n` +
        'Informe a nova senha ao cidadão por um canal seguro.'
      );

      this.fecharRedefinirSenha();

    } catch (erro) {

      this.erroSenha = mensagemErro(erro, 'Não foi possível redefinir a senha.');

    } finally {

      this.salvandoSenha = false;
      this.cdr.markForCheck();

    }

  }

  async concluirPedido(pedido: PedidoSenhaApi): Promise<void> {

    try {
      await this.api.concluirPedidoSenha(pedido.id);
    } catch {
      // Se não conseguir marcar, o pedido continua na lista para tentar de novo
    }

    await this.carregarPedidosSenha();

  }

  filtrar(): void {

    const termo = this.pesquisa.trim().toLowerCase();

    this.usuariosFiltrados = this.usuarios.filter(usuario => {

      const casaPesquisa =
        !termo ||
        usuario.nome?.toLowerCase().includes(termo) ||
        (termo.replace(/\D/g, '') !== '' &&
          usuario.cpf?.replace(/\D/g, '').includes(termo.replace(/\D/g, '')));

      const casaStatus =
        this.filtroStatus === 'Todos' ||
        usuario.status === this.filtroStatus;

      const casaSexo =
        this.filtroSexo === 'Todos' ||
        usuario.sexo === this.filtroSexo;

      return casaPesquisa && casaStatus && casaSexo;

    });

  }

  exibirCpf(cpf?: string): string {
    return cpf ? formatarCpf(cpf) : '-';
  }

  documentosAprovados(usuario: CidadaoView): boolean {

    const docs = usuario.documentos ?? [];

    return (
      docs.length > 0 &&
      docs.every(doc => doc.status === StatusDocumento.APROVADO)
    );

  }

  temAgendamento(usuario: CidadaoView): boolean {
    return !!usuario.agendamento;
  }

  avaliacaoConcluida(usuario: CidadaoView): boolean {
    return !!usuario.avaliacao?.resultado;
  }

  jaDecidido(usuario: CidadaoView): boolean {

    return (
      usuario.status === StatusAlistamento.APROVADO ||
      usuario.status === StatusAlistamento.REPROVADO
    );

  }

  podeEmitirParecer(usuario: CidadaoView): boolean {

    return (
      this.documentosAprovados(usuario) &&
      this.temAgendamento(usuario) &&
      this.avaliacaoConcluida(usuario) &&
      !this.jaDecidido(usuario)
    );

  }

  motivoBloqueioParecer(usuario: CidadaoView): string {

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

  podeAgendar(usuario: CidadaoView): boolean {

    return (
      this.documentosAprovados(usuario) &&
      !this.temAgendamento(usuario)
    );

  }

  motivoBloqueioAgendamento(usuario: CidadaoView): string {

    if (this.temAgendamento(usuario)) {
      return 'Este cidadão já possui avaliação agendada.';
    }

    if (!this.documentosAprovados(usuario)) {
      return 'Aprove todos os documentos antes de agendar.';
    }

    return '';

  }

  visualizar(usuario: CidadaoView): void {
    this.usuarioSelecionado = usuario;
    this.mostrarDetalhes = true;
  }

  fecharDetalhes(): void {
    this.usuarioSelecionado = null;
    this.mostrarDetalhes = false;
  }

  aprovar(usuario: CidadaoView): void {

    if (!this.podeEmitirParecer(usuario)) {
      alert(this.motivoBloqueioParecer(usuario));
      return;
    }

    if (!confirm(`Confirmar parecer APTO para ${usuario.nome}?`)) {
      return;
    }

    this.emitirParecer(usuario, StatusAlistamento.APROVADO);

  }

  reprovar(usuario: CidadaoView): void {

    if (!this.podeEmitirParecer(usuario)) {
      alert(this.motivoBloqueioParecer(usuario));
      return;
    }

    if (!confirm(`Confirmar DISPENSA para ${usuario.nome}?`)) {
      return;
    }

    this.emitirParecer(usuario, StatusAlistamento.REPROVADO);

  }

  async excluir(usuario: CidadaoView): Promise<void> {

    if (!confirm(`Excluir o cadastro de ${usuario.nome}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {

      await this.processoService.excluirCidadao(usuario.processo);

      this.fecharDetalhes();

      await this.carregarUsuarios();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível excluir o cidadão.'));

    }

  }

  agendar(usuario: CidadaoView): void {

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
    this.localSelecionado = null;
    this.medicoSelecionado = null;
    this.data = '';
    this.horario = '';
  }

  get dataMinima(): string {
    return hojeIso();
  }

  async confirmarAgendamento(): Promise<void> {

    const usuario = this.usuarioAgendamento;
    const alistamento = usuario?.processo.alistamento;

    if (!usuario || !alistamento) {
      return;
    }

    if (!this.localSelecionado || !this.medicoSelecionado || !this.data || !this.horario) {
      alert('Preencha todos os campos do agendamento.');
      return;
    }

    if (this.data < this.dataMinima) {
      alert('A data da avaliação não pode ser anterior a hoje.');
      return;
    }

    this.salvando = true;
    this.cdr.markForCheck();

    try {

      await this.api.cadastrarAgendamento({
        dataAgendamento: this.data,
        horario: horaParaApi(this.horario),
        idAlistamento: alistamento.id,
        idLocal: this.localSelecionado,
        idMedico: this.medicoSelecionado
      });

      await this.processoService.atualizarStatus(
        alistamento.id,
        StatusAlistamento.AVALIACAO_AGENDADA
      );

      alert('Avaliação médica agendada com sucesso.');

      this.fecharAgendamento();

      await this.carregarUsuarios();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível agendar a avaliação.'));

    } finally {

      this.salvando = false;
      this.cdr.markForCheck();

    }

  }

  private async emitirParecer(usuario: CidadaoView, status: StatusAlistamento): Promise<void> {

    const alistamento = usuario.processo.alistamento;

    if (!alistamento) {
      return;
    }

    try {

      await this.processoService.atualizarStatus(
        alistamento.id,
        status,
        this.auth.ehAdmin() ? this.auth.usuarioAtual()?.id : undefined
      );

      await this.carregarUsuarios();

    } catch (erro) {

      alert(mensagemErro(erro, 'Não foi possível registrar o parecer.'));

    }

  }

}