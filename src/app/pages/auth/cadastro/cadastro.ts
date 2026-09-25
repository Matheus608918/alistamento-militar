import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CadastroRascunhoService } from '../../../services/cadastro-rascunho.service';
import { cpfValido } from '../../../shared/utils/validadores';

interface FormularioCadastro {
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
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

  usuario: FormularioCadastro = {
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  };

  ngOnInit(): void {

    const salvo = this.rascunho.obter();

    if (salvo) {
      this.usuario = { ...salvo, confirmarSenha: salvo.senha };
    }

  }

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

    this.rascunho.salvar({
      nome: this.usuario.nome.trim(),
      cpf,
      dataNascimento: this.usuario.dataNascimento,
      email: this.usuario.email.trim(),
      telefone: this.usuario.telefone.trim(),
      senha: this.usuario.senha
    });

    this.router.navigate(['/cadastro-complementar']);

  }

}