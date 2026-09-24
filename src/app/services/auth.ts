import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Perfil } from '../shared/enums/perfil.enum';
import { API_BASE_URL } from '../core/api-config';

interface SessaoUsuario {
  id: number;
  nome: string;
  email: string;
  tipo: Perfil;
  telefone?: string;
  cpf?: string;
  crm?: string;
  especialidade?: string;
  dataNascimento?: string;
}

interface LoginResponse {
  token: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly CHAVE_TOKEN = 'authToken';
  private readonly CHAVE_SESSAO = 'usuarioLogado';

  private readonly _usuarioAtual = signal<SessaoUsuario | null>(this.lerSessao());

  readonly usuarioAtual = this._usuarioAtual.asReadonly();
  readonly autenticado = computed(() => this._usuarioAtual() !== null);
  readonly perfil = computed(() => this._usuarioAtual()?.tipo ?? null);

  private lerSessao(): SessaoUsuario | null {
    try {
      return JSON.parse(localStorage.getItem(this.CHAVE_SESSAO) || 'null');
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return localStorage.getItem(this.CHAVE_TOKEN);
  }

  private mapearPerfil(role: string): Perfil {

    switch (role) {
      case 'ADMIN': return Perfil.ADMIN;
      case 'MEDICO': return Perfil.MEDICO;
      default: return Perfil.CIDADAO;
    }

  }

  async entrar(email: string, senha: string): Promise<string | null> {

    try {

      const resposta = await firstValueFrom(
        this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, { email, senha })
      );

      const perfil = this.mapearPerfil(resposta.role);

      localStorage.setItem(this.CHAVE_TOKEN, resposta.token);

      const sessao = await this.buscarPerfilCompleto(perfil, email);

      localStorage.setItem(this.CHAVE_SESSAO, JSON.stringify(sessao));
      this._usuarioAtual.set(sessao);

      return this.rotaInicial(perfil);

    } catch {

      return null;

    }

  }

  private async buscarPerfilCompleto(perfil: Perfil, email: string): Promise<SessaoUsuario> {

    switch (perfil) {

      case Perfil.MEDICO: {

        const medicos = await firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/medico`));
        const m = medicos.find(x => x.emailMedico === email);

        return {
          id: m.id, nome: m.nomeMedico, email: m.emailMedico, tipo: Perfil.MEDICO,
          telefone: m.telefoneMedico, crm: m.crm, especialidade: m.especialidade
        };

      }

      case Perfil.ADMIN: {

        const admins = await firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/administrador`));
        const a = admins.find(x => x.emailAdmin === email);

        return { id: a.id, nome: a.nomeAdmin, email: a.emailAdmin, tipo: Perfil.ADMIN };

      }

      default: {

        const usuarios = await firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/usuario`));
        const u = usuarios.find(x => x.email === email);

        return {
          id: u.id, nome: u.nome, email: u.email, tipo: Perfil.CIDADAO,
          telefone: u.telefone, cpf: u.cpf, dataNascimento: u.dataNascimento
        };

      }

    }

  }

  sair(): void {

    localStorage.removeItem(this.CHAVE_TOKEN);
    localStorage.removeItem(this.CHAVE_SESSAO);

    this._usuarioAtual.set(null);
    this.router.navigate(['/login']);

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

}