import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Perfil } from '../shared/enums/perfil.enum';
import { ApiService } from './api.service';
import { LoginResponse } from '../models/api.models';

export interface SessaoUsuario {
  id: number;
  nome: string;
  email: string;
  tipo: Perfil;
  telefone?: string | null;
  cpf?: string;
  crm?: string;
  especialidade?: string | null;
  dataNascimento?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = inject(ApiService);
  private router = inject(Router);

  private readonly CHAVE_TOKEN = 'authToken';
  private readonly CHAVE_SESSAO = 'usuarioLogado';

  private readonly _usuarioAtual = signal<SessaoUsuario | null>(this.lerSessao());

  readonly usuarioAtual = this._usuarioAtual.asReadonly();
  readonly autenticado = computed(() => this._usuarioAtual() !== null);
  readonly perfil = computed(() => this._usuarioAtual()?.tipo ?? null);

  get token(): string | null {
    return localStorage.getItem(this.CHAVE_TOKEN);
  }

  tokenValido(): boolean {

    const token = this.token;

    if (!token) {
      return false;
    }

    try {

      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as { exp?: number };

      return !payload.exp || payload.exp * 1000 > Date.now();

    } catch {

      return false;

    }

  }

  verificarSessao(): boolean {

    if (this._usuarioAtual() && this.tokenValido()) {
      return true;
    }

    this.limparSessao();

    return false;

  }

  /*
   Login com JWT:
   1. envia e-mail e senha para a API;
   2. a API confere a senha (BCrypt) e devolve um token JWT assinado, válido por 2 horas;
   3. o token fica guardado no navegador e o interceptor o envia em toda requisição;
   4. com o perfil (role) devolvido, o front abre o painel certo.
   */
  async entrar(email: string, senha: string): Promise<string> {

    this.limparSessao();

    const emailNormalizado = email.trim();

    let resposta: LoginResponse;

    try {

      resposta = await this.fazerLogin(emailNormalizado, senha);

      localStorage.setItem(this.CHAVE_TOKEN, resposta.token);

    } catch (erro) {

      if (erro instanceof HttpErrorResponse && erro.status === 0) {
        throw new Error('Não foi possível conectar à API. Verifique se o back-end está rodando.');
      }

      throw new Error('E-mail ou senha inválidos.');

    }

    try {

      const sessao = await this.identificarPerfil(emailNormalizado, resposta);

      localStorage.setItem(this.CHAVE_SESSAO, JSON.stringify(sessao));
      this._usuarioAtual.set(sessao);

      return this.rotaInicial(sessao.tipo);

    } catch (erro) {

      this.limparSessao();

      throw erro instanceof Error && !(erro instanceof HttpErrorResponse)
        ? erro
        : new Error('Login realizado, mas não foi possível carregar os dados do perfil.');

    }

  }

  // Usa o login único (/auth/login). Se a API ainda não tiver esse endpoint, usa o antigo.
  private async fazerLogin(email: string, senha: string): Promise<LoginResponse> {

    try {

      const resposta = await this.api.login(email, senha);

      return { ...resposta, role: resposta.role ?? null };

    } catch (erro) {

      const endpointAusente = erro instanceof HttpErrorResponse && [404, 405].includes(erro.status);

      if (!endpointAusente) {
        throw erro;
      }

      // O login antigo sempre responde "USER", então o perfil é descoberto depois
      const resposta = await this.api.loginLegado(email, senha);

      return { token: resposta.token, role: null };

    }

  }

  private perfilDaRole(role?: string | null): Perfil | null {

    switch ((role ?? '').toUpperCase()) {
      case 'ADMIN': return Perfil.ADMIN;
      case 'MEDICO': return Perfil.MEDICO;
      case 'USER': return Perfil.CIDADAO;
      default: return null;
    }

  }

  /*
   Monta os dados da sessão.
   Com o perfil vindo do token, só a informação daquele perfil é buscada
   (LGPD: o cidadão não precisa carregar a lista de outros cidadãos).
   */
  private async identificarPerfil(email: string, resposta: LoginResponse): Promise<SessaoUsuario> {

    const alvo = email.toLowerCase();
    const perfil = this.perfilDaRole(resposta.role);

    if (perfil === null || perfil === Perfil.CIDADAO) {

      const u = resposta.id && perfil === Perfil.CIDADAO
        ? await this.api.buscarUsuario(resposta.id)
        : (await this.api.listarUsuarios()).find(x => x.email?.toLowerCase() === alvo);

      if (u) {
        return {
          id: u.id,
          nome: u.nome,
          email: u.email,
          tipo: Perfil.CIDADAO,
          telefone: u.telefone,
          cpf: u.cpf,
          dataNascimento: u.dataNascimento
        };
      }

    }

    if (perfil === null || perfil === Perfil.MEDICO) {

      const medicos = await this.api.listarMedicos();
      const m = medicos.find(x =>
        resposta.id ? x.id === resposta.id : x.emailMedico?.toLowerCase() === alvo);

      if (m) {
        return {
          id: m.id,
          nome: m.nomeMedico,
          email: m.emailMedico ?? email,
          tipo: Perfil.MEDICO,
          telefone: m.telefoneMedico,
          crm: m.crm,
          especialidade: m.especialidade
        };
      }

    }

    if (perfil === null || perfil === Perfil.ADMIN) {

      if (resposta.id && resposta.nome) {
        return {
          id: resposta.id,
          nome: resposta.nome,
          email,
          tipo: Perfil.ADMIN
        };
      }

      const admins = await this.api.listarAdministradores();
      const a = admins.find(x => x.emailAdmin?.toLowerCase() === alvo);

      if (a) {
        return {
          id: a.id,
          nome: a.nomeAdmin,
          email: a.emailAdmin,
          tipo: Perfil.ADMIN
        };
      }

    }

    throw new Error('Perfil não encontrado para este e-mail.');

  }


  /*
   Encerra a sessão: apaga o token e os dados guardados no navegador.
   expirou = true quando o token venceu ou foi recusado pela API.
   */
  sair(expirou = false): void {

    const estavaLogado = this._usuarioAtual() !== null;

    this.limparSessao();

    if (expirou) {

      // Várias requisições podem receber 401 ao mesmo tempo: só a primeira redireciona
      if (estavaLogado) {
        this.router.navigate(['/login'], { queryParams: { sessao: 'expirada' } });
      }

      return;

    }

    this.router.navigate(['/login']);

  }

  limparSessao(): void {

    localStorage.removeItem(this.CHAVE_TOKEN);
    localStorage.removeItem(this.CHAVE_SESSAO);

    this._usuarioAtual.set(null);

  }

  rotaInicial(perfil?: string | null): string {

    switch (perfil) {
      case Perfil.ADMIN: return '/admin/dashboard';
      case Perfil.MEDICO: return '/medico/dashboard';
      default: return '/dashboard';
    }

  }

  temPerfil(perfis: string[]): boolean {
    const atual = this._usuarioAtual();
    if (!atual?.tipo) return false;
    return perfis.includes(atual.tipo);
  }

  ehAdmin(): boolean { return this.temPerfil([Perfil.ADMIN]); }
  ehMedico(): boolean { return this.temPerfil([Perfil.MEDICO]); }
  ehCidadao(): boolean { return this.temPerfil([Perfil.CIDADAO]); }

  private lerSessao(): SessaoUsuario | null {

    try {
      return localStorage.getItem(this.CHAVE_TOKEN)
        ? JSON.parse(localStorage.getItem(this.CHAVE_SESSAO) || 'null')
        : null;
    } catch {
      return null;
    }

  }

}