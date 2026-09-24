import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly STORAGE_KEY = 'usuarios';
  private readonly LOGADO_KEY = 'usuarioLogado';

  listarUsuarios(): Usuario[] {

    try {

      return JSON.parse(
        localStorage.getItem(this.STORAGE_KEY) || '[]'
      );

    } catch {

      return [];

    }

  }

  listarCidadaos(): Usuario[] {

    return this.listarUsuarios().filter(

      usuario => usuario.tipo === 'cidadao'

    );

  }

  salvarUsuarios(usuarios: Usuario[]): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(usuarios)
    );

  }

  adicionarUsuario(usuario: Usuario): void {

    const usuarios = this.listarUsuarios();

    usuarios.push(usuario);

    this.salvarUsuarios(usuarios);

  }

  buscarPorEmail(email: string): Usuario | undefined {

    return this.listarUsuarios().find(

      usuario => usuario.email === email

    );

  }

  buscarPorCpf(cpf: string): Usuario | undefined {

    const cpfLimpo = cpf.replace(/\D/g, '');

    return this.listarUsuarios().find(usuario => {

      if (!usuario.cpf) {

        return false;

      }

      return usuario.cpf.replace(/\D/g, '') === cpfLimpo;

    });

  }

  buscarUsuarioLogado(): Usuario | null {

    try {

      return JSON.parse(

        localStorage.getItem(this.LOGADO_KEY) || 'null'

      );

    } catch {

      return null;

    }

  }

  salvarUsuarioLogado(usuario: Usuario): void {

    localStorage.setItem(

      this.LOGADO_KEY,

      JSON.stringify(usuario)

    );

  }

  atualizarUsuario(usuarioAtualizado: Usuario): void {

    const usuarios = this.listarUsuarios();

    const indice = usuarios.findIndex(

      usuario => usuario.email === usuarioAtualizado.email

    );

    if (indice === -1) {

      return;

    }

    const senhaAnterior = usuarios[indice].senha;

    const usuarioFinal: Usuario = {
      ...usuarioAtualizado,
      senha: usuarioAtualizado.senha || senhaAnterior
    };

    usuarios[indice] = usuarioFinal;

    this.salvarUsuarios(usuarios);

    const logado = this.buscarUsuarioLogado();

    if (

      logado &&

      logado.email === usuarioFinal.email

    ) {

      const { senha, ...semSenha } = usuarioFinal as any;

      this.salvarUsuarioLogado(semSenha as Usuario);

    }

  }

  excluirUsuario(email: string): void {

    const usuarios = this.listarUsuarios().filter(

      usuario => usuario.email !== email

    );

    this.salvarUsuarios(usuarios);

  }

  logout(): void {

    localStorage.removeItem(this.LOGADO_KEY);

  }

}