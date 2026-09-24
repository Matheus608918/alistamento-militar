import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StatusAlistamento } from '../../../shared/enums/perfil.enum';

@Component({
  selector: 'app-avaliacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './avaliacao.html',
  styleUrl: './avaliacao.css'
})
export class Avaliacao implements OnInit {

  usuarios: any[] = [];

  paciente: any = null;

  resultado = '';

  observacoes = '';

  medico: any = {};

  ngOnInit(): void {

    this.usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    this.medico = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    const emailPaciente = localStorage.getItem(
      'pacienteSelecionado'
    );

    this.paciente = this.usuarios.find(
      (u: any) => u.email === emailPaciente
    ) || null;

  }

  salvar() {

    if (!this.resultado) {

      alert('Selecione o resultado da avaliação.');

      return;

    }

    this.paciente.avaliacao = {

      data: new Date().toLocaleDateString('pt-BR'),

      resultado: this.resultado,

      observacoes: this.observacoes,

      medico: this.medico.nome || 'Médico'

    };

    this.paciente.status = StatusAlistamento.AVALIACAO_CONCLUIDA;

    if (this.paciente.agendamento) {

      this.paciente.agendamento.status = 'Concluído';

    }

    const indice = this.usuarios.findIndex(
      (u: any) => u.email === this.paciente.email
    );

    if (indice !== -1) {

      this.usuarios[indice] = this.paciente;

    }

    localStorage.setItem(
      'usuarios',
      JSON.stringify(this.usuarios)
    );

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    if (usuarioLogado.email === this.paciente.email) {

      const { senha, ...pacienteSemSenha } = this.paciente;

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(pacienteSemSenha)
      );

    }

    alert('Avaliação médica salva com sucesso!');

  }

}