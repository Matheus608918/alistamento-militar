import { Injectable } from '@angular/core';

export interface RascunhoCadastro {
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  senha: string;
}

@Injectable({ providedIn: 'root' })
export class CadastroRascunhoService {

  private dados: RascunhoCadastro | null = null;

  salvar(dados: RascunhoCadastro): void {
    this.dados = { ...dados };
  }

  obter(): RascunhoCadastro | null {
    return this.dados;
  }

  temRascunho(): boolean {
    return this.dados !== null;
  }

  limpar(): void {
    this.dados = null;
  }

}