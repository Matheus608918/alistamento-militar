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
  UsuarioRequest
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

  login(email: string, senha: string): Promise<LoginResponse> {
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