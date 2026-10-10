import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CadastroRascunhoService } from '../../../services/cadastro-rascunho.service';
import {
  NACIONALIDADES,
  SEXOS,
  cpfValido,
  erroIdadeAlistamento
} from '../../../shared/utils/validadores';
import { hojeIso } from '../../../shared/utils/formatadores';

interface FormularioCadastro {
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  nacionalidade: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  consentimentoLgpd: boolean;
}

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
export class Cadastro implements OnInit {

  private router = inject(Router);
  private rascunho = inject(CadastroRascunhoService);

  readonly sexos = SEXOS;

  readonly nacionalidades = NACIONALIDADES;

  readonly dataMaxima = hojeIso();

  usuario: FormularioCadastro = {
    nome: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    nacionalidade: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    consentimentoLgpd: false
  };

  ngOnInit(): void {

    const salvo = this.rascunho.obter();

    if (salvo) {
      this.usuario = { ...salvo, confirmarSenha: salvo.senha };
    }

  }

  get aviso(): string {

    if (this.usuario.sexo === 'Feminino') {
      return 'Para mulheres, o alistamento é voluntário e só pode ser feito no ano em que você completa 18 anos.';
    }

    if (this.usuario.sexo === 'Masculino') {
      return 'Para homens, o alistamento é obrigatório a partir do ano em que você completa 18 anos.';
    }

    return '';

  }

  cadastrar() {

    if (
      !this.usuario.nome ||
      !this.usuario.cpf ||
      !this.usuario.dataNascimento ||
      !this.usuario.sexo ||
      !this.usuario.nacionalidade ||
      !this.usuario.email ||
      !this.usuario.telefone ||
      !this.usuario.senha ||
      !this.usuario.confirmarSenha
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    // LGPD: sem o aceite da Política de Privacidade o cadastro não continua
    if (!this.usuario.consentimentoLgpd) {
      alert('Para continuar, leia e aceite a Política de Privacidade.');
      return;
    }

    if (this.usuario.senha.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (this.usuario.senha !== this.usuario.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    const erroIdade = erroIdadeAlistamento(this.usuario.dataNascimento, this.usuario.sexo);

    if (erroIdade) {
      alert(erroIdade);
      return;
    }

    const cpf = this.usuario.cpf.replace(/\D/g, '');

    if (!cpfValido(cpf)) {
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

    this.rascunho.salvar({
      nome: this.usuario.nome.trim(),
      cpf,
      dataNascimento: this.usuario.dataNascimento,
      sexo: this.usuario.sexo,
      nacionalidade: this.usuario.nacionalidade,
      email: this.usuario.email.trim(),
      telefone: this.usuario.telefone.trim(),
      senha: this.usuario.senha,
      consentimentoLgpd: this.usuario.consentimentoLgpd
    });

    this.router.navigate(['/cadastro-complementar']);

  }

}