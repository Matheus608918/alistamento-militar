import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro-complementar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './cadastro-complementar.html',
  styleUrl: './cadastro-complementar.css'
})
export class CadastroComplementar {

  cadastroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    this.cadastroForm = this.fb.group({

      nome: [
        usuarioLogado.nome || '',
        Validators.required
      ],

      nomeMae: [
        '',
        Validators.required
      ],

      nomePai: [''],

      cpf: [
        usuarioLogado.cpf || '',
        Validators.required
      ],

      rg: [
        '',
        Validators.required
      ],

      dataNascimento: [
        usuarioLogado.dataNascimento || '',
        Validators.required
      ],

      localNascimento: [''],

      estadoCivil: [''],

      escolaridade: [''],

      telefone: [
        usuarioLogado.telefone || ''
      ],

      email: [
        usuarioLogado.email || '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      cep: [''],

      logradouro: [''],

      numero: [''],

      bairro: [''],

      municipio: [''],

      uf: [''],

      pais: ['Brasil'],

      zonaResidencial: [''],

      voluntario: [false]

    });

  }

  validarFormulario(): boolean {

    const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;

    const rgRegex = /^[0-9.\-]{7,15}$/;

    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

    const cepRegex = /^\d{5}-?\d{3}$/;

    const ufRegex = /^[A-Za-z]{2}$/;

    const nome = this.cadastroForm.value.nome?.trim();

    const nomeMae = this.cadastroForm.value.nomeMae?.trim();

    const nomePai = this.cadastroForm.value.nomePai?.trim();

    if (!nomeRegex.test(nome)) {
      alert('Nome inválido. Digite apenas letras.');
      return false;
    }

    if (!nomeRegex.test(nomeMae)) {
      alert('Nome da mãe inválido. Digite apenas letras.');
      return false;
    }

    if (nomePai && !nomeRegex.test(nomePai)) {
      alert('Nome do pai inválido. Digite apenas letras.');
      return false;
    }

    if (!rgRegex.test(this.cadastroForm.value.rg)) {
      alert('RG inválido.');
      return false;
    }

    if (
      this.cadastroForm.value.telefone &&
      !telefoneRegex.test(this.cadastroForm.value.telefone)
    ) {
      alert('Telefone inválido.');
      return false;
    }

    if (
      this.cadastroForm.value.cep &&
      !cepRegex.test(this.cadastroForm.value.cep)
    ) {
      alert('CEP inválido.');
      return false;
    }

    if (
      this.cadastroForm.value.uf &&
      !ufRegex.test(this.cadastroForm.value.uf)
    ) {
      alert('UF inválida.');
      return false;
    }

    return true;

  }

  salvar() {

    if (this.cadastroForm.invalid) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    const usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    const indice = usuarios.findIndex(
      (u: any) => u.email === usuarioLogado.email
    );

    if (indice === -1) {
      alert('Usuário não encontrado.');
      return;
    }

    const usuarioAtualizado = {
      ...usuarios[indice],
      ...this.cadastroForm.value
    };

    usuarios[indice] = usuarioAtualizado;

    localStorage.setItem(
      'usuarios',
      JSON.stringify(usuarios)
    );

    const { senha, ...semSenha } = usuarioAtualizado;

    localStorage.setItem(
      'usuarioLogado',
      JSON.stringify(semSenha)
    );

    alert('Cadastro complementar concluído com sucesso!');

    this.router.navigate(['/dashboard']);

  }

}