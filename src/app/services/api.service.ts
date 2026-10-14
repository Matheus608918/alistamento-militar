import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../core/api-config';
import {
  AdministradorApi,
  AgendamentoApi,
  AgendamentoRequest,
  AlistamentoApi,
  AlistamentoCompletoApi,
  AlistamentoRequest,
  AvaliacaoMedicaApi,
  AvaliacaoMedicaRequest,
  DocumentoApi,
  DocumentoRequest,
  LocalApi,
  LocalRequest,
  LoginResponse,
  MedicoApi,
  MedicoRequest,
  TipoDocumentoApi,
  TipoDocumentoRequest,
  UsuarioApi,
  UsuarioRequest,
  PedidoSenhaApi
} from '../models/api.models';

export function mensagemErro(erro: unknown, padrao = 'Ocorreu um erro inesperado.'): string {

  if (erro instanceof HttpErrorResponse) {

    if (erro.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o back-end está rodando na porta 8080.';
    }

    const corpo = erro.error as { mensagem?: string; message?: string } | null;

    if (corpo && typeof corpo === 'object') {
      if (corpo.mensagem) return corpo.mensagem;
      if (corpo.message) return corpo.message;
    }

    if (erro.status === 403) {
      return 'A API recusou a operação (403). Verifique os dados informados ou se o registro possui vínculos.';
    }

    return `${padrao} (HTTP ${erro.status})`;

  }

  if (erro instanceof Error && erro.message) {
    return erro.message;
  }

  return padrao;

}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private http = inject(HttpClient);

  private url(caminho: string): string {
    return `${API_BASE_URL}${caminho}`;
  }

  private get<T>(caminho: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(this.url(caminho)));
  }

  private post<T>(caminho: string, corpo: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(this.url(caminho), corpo));
  }

  private put<T>(caminho: string, corpo: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(this.url(caminho), corpo));
  }

  private patch<T>(caminho: string, corpo: unknown): Promise<T> {
    return firstValueFrom(this.http.patch<T>(this.url(caminho), corpo));
  }

  private delete<T>(caminho: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(this.url(caminho)));
  }

  /*
   Login único para cidadão, médico e administrador.
   A API devolve o token JWT e o perfil (role) de quem entrou.
   */
  login(email: string, senha: string): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', { email, senha });
  }

  // Login antigo, usado só se /auth/login não existir na API
  loginLegado(email: string, senha: string): Promise<LoginResponse> {
    return this.post<LoginResponse>('/usuario/login', { email, senha });
  }

  listarUsuarios(): Promise<UsuarioApi[]> {
    return this.get<UsuarioApi[]>('/usuario');
  }

  buscarUsuario(id: number): Promise<UsuarioApi> {
    return this.get<UsuarioApi>(`/usuario/${id}`);
  }

  cadastrarUsuario(dto: UsuarioRequest): Promise<UsuarioApi> {
    return this.post<UsuarioApi>('/usuario', dto);
  }

  atualizarUsuario(id: number, dto: UsuarioRequest): Promise<UsuarioApi> {
    return this.put<UsuarioApi>(`/usuario/${id}`, dto);
  }

  /*
   Redefinição de senha pelo administrador.
   Busca os dados atuais do cidadão e envia tudo de volta com a nova senha
   (a API só troca a senha quando ela vem preenchida e grava criptografada).
   */
  async redefinirSenhaUsuario(id: number, novaSenha: string): Promise<UsuarioApi> {

    const u = await this.buscarUsuario(id);

    const dto: UsuarioRequest = {
      nome: u.nome,
      dataNascimento: u.dataNascimento,
      sexo: u.sexo ?? '',
      nacionalidade: u.nacionalidade ?? '',
      email: u.email,
      senha: novaSenha,
      telefone: u.telefone,
      cpf: u.cpf,
      nomePai: u.nomePai ?? null,
      nomeMae: u.nomeMae ?? null,
      estadoCivil: u.estadoCivil ?? null,
      uf: u.uf ?? null,
      escolaridade: u.escolaridade ?? null,
      rg: u.rg ?? null,
      localNascimento: u.localNascimento ?? null,
      cep: u.cep ?? null,
      bairro: u.bairro ?? null,
      municipio: u.municipio ?? null,
      paisResidencia: u.paisResidencia ?? null,
      zonaResidencial: u.zonaResidencial ?? null,
      numeroResidencia: u.numeroResidencia ?? null,
      logradouro: u.logradouro ?? null,
      estado: u.estado ?? null,
      consentimentoLgpd: true
    };

    return this.atualizarUsuario(id, dto);

  }

  // ----- Recuperação de senha (versão simples) -----

  // Público: registra o pedido feito na tela "Esqueci minha senha"
  solicitarNovaSenha(email: string): Promise<void> {
    return this.post<void>('/recuperacao-senha', { email });
  }

  // Administrador: pedidos ainda não atendidos
  listarPedidosSenha(): Promise<PedidoSenhaApi[]> {
    return this.get<PedidoSenhaApi[]>('/recuperacao-senha');
  }

  // Administrador: marca o pedido como atendido
  concluirPedidoSenha(id: number): Promise<void> {
    return this.patch<void>(`/recuperacao-senha/${id}/concluir`, {});
  }

  excluirUsuario(id: number): Promise<UsuarioApi> {
    return this.delete<UsuarioApi>(`/usuario/${id}`);
  }

  async buscarAlistamentoDoUsuario(idUsuario: number): Promise<AlistamentoApi | null> {

    try {
      return await this.get<AlistamentoApi>(`/usuario/${idUsuario}/alistamento`);
    } catch (erro) {
      if (erro instanceof HttpErrorResponse && erro.status === 404) {
        return null;
      }
      throw erro;
    }

  }

  listarAdministradores(): Promise<AdministradorApi[]> {
    return this.get<AdministradorApi[]>('/administrador');
  }

  listarMedicos(): Promise<MedicoApi[]> {
    return this.get<MedicoApi[]>('/medico');
  }

  cadastrarMedico(dto: MedicoRequest): Promise<MedicoApi> {
    return this.post<MedicoApi>('/medico', dto);
  }

  atualizarMedico(id: number, dto: MedicoRequest): Promise<MedicoApi> {
    return this.put<MedicoApi>(`/medico/${id}`, dto);
  }

  excluirMedico(id: number): Promise<MedicoApi> {
    return this.delete<MedicoApi>(`/medico/${id}`);
  }

  listarAlistamentos(): Promise<AlistamentoApi[]> {
    return this.get<AlistamentoApi[]>('/alistamento');
  }

  buscarAlistamentoCompleto(id: number): Promise<AlistamentoCompletoApi> {
    return this.get<AlistamentoCompletoApi>(`/alistamento/${id}/completo`);
  }

  criarAlistamento(dto: AlistamentoRequest): Promise<AlistamentoApi> {
    return this.post<AlistamentoApi>('/alistamento', dto);
  }

  atualizarAlistamentoParcial(id: number, dto: AlistamentoRequest): Promise<AlistamentoApi> {
    return this.patch<AlistamentoApi>(`/alistamento/${id}`, dto);
  }

  excluirAlistamento(id: number): Promise<AlistamentoApi> {
    return this.delete<AlistamentoApi>(`/alistamento/${id}`);
  }

  listarLocais(): Promise<LocalApi[]> {
    return this.get<LocalApi[]>('/local');
  }

  cadastrarLocal(dto: LocalRequest): Promise<LocalApi> {
    return this.post<LocalApi>('/local', dto);
  }

  atualizarLocal(id: number, dto: LocalRequest): Promise<LocalApi> {
    return this.put<LocalApi>(`/local/${id}`, dto);
  }

  excluirLocal(id: number): Promise<void> {
    return this.delete<void>(`/local/${id}`);
  }

  listarTiposDocumento(): Promise<TipoDocumentoApi[]> {
    return this.get<TipoDocumentoApi[]>('/tipos-documento');
  }

  cadastrarTipoDocumento(dto: TipoDocumentoRequest): Promise<TipoDocumentoApi> {
    return this.post<TipoDocumentoApi>('/tipos-documento', dto);
  }

  atualizarTipoDocumento(id: number, dto: TipoDocumentoRequest): Promise<TipoDocumentoApi> {
    return this.put<TipoDocumentoApi>(`/tipos-documento/${id}`, dto);
  }

  excluirTipoDocumento(id: number): Promise<void> {
    return this.delete<void>(`/tipos-documento/${id}`);
  }

  listarDocumentos(): Promise<DocumentoApi[]> {
    return this.get<DocumentoApi[]>('/documentos');
  }

  cadastrarDocumento(dto: DocumentoRequest): Promise<DocumentoApi> {
    return this.post<DocumentoApi>('/documentos', dto);
  }

  /*
   Arquivo do documento (imagem ou PDF).
   O documento é cadastrado primeiro (dados) e depois o arquivo é enviado
   para a API em formato multipart, no campo "arquivo".
   */
  enviarArquivoDocumento(id: number, arquivo: File): Promise<void> {
    const formulario = new FormData();
    formulario.append('arquivo', arquivo, arquivo.name);
    return this.post<void>(`/documentos/${id}/arquivo`, formulario);
  }

  // Baixa o arquivo do documento para exibir na tela (admin ou o próprio cidadão)
  baixarArquivoDocumento(id: number): Promise<Blob> {
    return firstValueFrom(
      this.http.get(this.url(`/documentos/${id}/arquivo`), { responseType: 'blob' })
    );
  }

  excluirDocumento(id: number): Promise<DocumentoApi> {
    return this.delete<DocumentoApi>(`/documentos/${id}`);
  }

  listarAgendamentos(): Promise<AgendamentoApi[]> {
    return this.get<AgendamentoApi[]>('/agendamentos');
  }

  cadastrarAgendamento(dto: AgendamentoRequest): Promise<AgendamentoApi> {
    return this.post<AgendamentoApi>('/agendamentos', dto);
  }

  excluirAgendamento(id: number): Promise<AgendamentoApi> {
    return this.delete<AgendamentoApi>(`/agendamentos/${id}`);
  }

  confirmarPresenca(id: number): Promise<AgendamentoApi> {
    return this.patch<AgendamentoApi>(`/agendamentos/${id}/confirmar`, {});
  }

  listarAvaliacoes(): Promise<AvaliacaoMedicaApi[]> {
    return this.get<AvaliacaoMedicaApi[]>('/avaliacoes-medicas');
  }

  cadastrarAvaliacao(dto: AvaliacaoMedicaRequest): Promise<AvaliacaoMedicaApi> {
    return this.post<AvaliacaoMedicaApi>('/avaliacoes-medicas', dto);
  }

  excluirAvaliacao(id: number): Promise<AvaliacaoMedicaApi> {
    return this.delete<AvaliacaoMedicaApi>(`/avaliacoes-medicas/${id}`);
  }

}