import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../services/auth';

import { Perfil, StatusAlistamento } from '../../../shared/enums/perfil.enum';
import { cpfValido } from '../../../shared/utils/validadores';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private auth: AuthService
  ) {}

  usuario: Usuario = {
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  };

  validarCPF(cpf: string): boolean {
    return cpfValido(cpf);
  }

  cadastrar() {

    if (
      !this.usuario.nome ||
      !this.usuario.cpf ||
      !this.usuario.dataNascimento ||
      !this.usuario.email ||
      !this.usuario.telefone ||
      !this.usuario.senha ||
      !this.usuario.confirmarSenha
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    if (this.usuario.senha !== this.usuario.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    const nascimento = new Date(this.usuario.dataNascimento);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    if (idade < 18) {
      alert('O alistamento é permitido apenas para maiores de 18 anos.');
      return;
    }

    const cpf = this.usuario.cpf.replace(/\D/g, '');

    if (!this.validarCPF(cpf)) {
      alert('CPF inválido.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.usuario.email)) {
      alert('E-mail inválido.');
      return;
    }

    const telefone = this.usuario.telefone.replace(/\D/g, '');

    if (telefone.length < 10 || telefone.length > 11) {
      alert('Telefone inválido.');
      return;
    }

    const emailExiste = this.usuarioService.buscarPorEmail(this.usuario.email);

    if (emailExiste) {
      alert('Este e-mail já está cadastrado.');
      return;
    }

    const cpfExiste = this.usuarioService.buscarPorCpf(cpf);

    if (cpfExiste) {
      alert('Este CPF já está cadastrado.');
      return;
    }

    const novoUsuario: Usuario = {

      ...this.usuario,

      senha: this.auth.criarHashSenha(this.usuario.senha),

      confirmarSenha: undefined,

      cpf,

      tipo: Perfil.CIDADAO,

      status: StatusAlistamento.AGUARDANDO_DOCUMENTOS,

      documentos: [],

      dataCadastro: new Date().toLocaleDateString('pt-BR')

    };

    this.usuarioService.adicionarUsuario(novoUsuario);

    this.auth.entrar(novoUsuario.email, this.usuario.senha);

    alert('Cadastro realizado com sucesso!');

    this.router.navigate(['/cadastro-complementar']);

  }

}