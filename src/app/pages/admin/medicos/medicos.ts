import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth';
import { Perfil } from '../../../shared/enums/perfil.enum';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './medicos.html',
  styleUrl: './medicos.css'
})
export class Medicos implements OnInit {

  private auth = inject(AuthService);

  medicos: any[] = [];

  medico = {
    nome: '',
    email: '',
    senha: '',
    crm: '',
    especialidade: '',
    telefone: ''
  };

  editando = false;

  indiceEdicao = -1;

  emailOriginal = '';

  ngOnInit(): void {
    this.carregarMedicos();
  }

  carregarMedicos() {

    this.medicos = JSON.parse(
      localStorage.getItem('medicos') || '[]'
    );

  }

  salvar() {

    if (
      !this.medico.nome ||
      !this.medico.email ||
      !this.medico.senha ||
      !this.medico.crm ||
      !this.medico.especialidade ||
      !this.medico.telefone
    ) {

      alert('Preencha todos os campos.');
      return;

    }

    if (this.editando) {

      this.medicos[this.indiceEdicao] = {
        ...this.medico,
        senha: undefined
      };

      let usuarios = JSON.parse(
        localStorage.getItem('usuarios') || '[]'
      );

      const indiceUsuario = usuarios.findIndex(
        (u: any) => u.email === this.emailOriginal
      );

      if (indiceUsuario !== -1) {

        usuarios[indiceUsuario] = {
          ...this.medico,
          senha: this.auth.criarHashSenha(this.medico.senha),
          tipo: Perfil.MEDICO
        };

      }

      localStorage.setItem(
        'usuarios',
        JSON.stringify(usuarios)
      );

      alert('Médico atualizado com sucesso.');

    } else {

      this.medicos.push({
        ...this.medico,
        senha: undefined
      });

      let usuarios = JSON.parse(
        localStorage.getItem('usuarios') || '[]'
      );

      usuarios.push({
        ...this.medico,
        senha: this.auth.criarHashSenha(this.medico.senha),
        tipo: Perfil.MEDICO
      });

      localStorage.setItem(
        'usuarios',
        JSON.stringify(usuarios)
      );

      alert('Médico cadastrado com sucesso.');

    }

    localStorage.setItem(
      'medicos',
      JSON.stringify(this.medicos)
    );

    this.limparFormulario();

    this.carregarMedicos();

  }

  editar(indice: number) {

    this.editando = true;

    this.indiceEdicao = indice;

    this.emailOriginal = this.medicos[indice].email;

    this.medico = {
      ...this.medicos[indice]
    };

  }

  excluir(indice: number) {

    if (!confirm('Deseja excluir este médico?')) {
      return;
    }

    const email = this.medicos[indice].email;

    this.medicos.splice(indice, 1);

    localStorage.setItem(
      'medicos',
      JSON.stringify(this.medicos)
    );

    let usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    usuarios = usuarios.filter(
      (u: any) => u.email !== email
    );

    localStorage.setItem(
      'usuarios',
      JSON.stringify(usuarios)
    );

    this.carregarMedicos();

  }

  limparFormulario() {

    this.medico = {
      nome: '',
      email: '',
      senha: '',
      crm: '',
      especialidade: '',
      telefone: ''
    };

    this.editando = false;

    this.indiceEdicao = -1;

    this.emailOriginal = '';

  }

}