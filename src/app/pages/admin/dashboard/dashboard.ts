import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  usuarios: any[] = [];
  medicos: any[] = [];

  ultimosUsuarios: any[] = [];
  ultimosAgendamentos: any[] = [];

  totalUsuarios = 0;
  totalMedicos = 0;
  totalDocumentos = 0;
  totalAgendamentos = 0;
  totalAvaliacoes = 0;

  aprovados = 0;
  reprovados = 0;
  emAnalise = 0;

  ngOnInit(): void {
    this.carregarInformacoes();
  }

  carregarInformacoes(): void {

    const todosUsuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    this.usuarios = todosUsuarios.filter(
      (usuario: any) => usuario.tipo === 'cidadao'
    );

    this.medicos = JSON.parse(
      localStorage.getItem('medicos') || '[]'
    );

    this.totalUsuarios = this.usuarios.length;
    this.totalMedicos = this.medicos.length;

    this.totalDocumentos = 0;
    this.totalAgendamentos = 0;
    this.totalAvaliacoes = 0;

    this.aprovados = 0;
    this.reprovados = 0;
    this.emAnalise = 0;

    this.usuarios.forEach(usuario => {

      if (usuario.documentos) {
        this.totalDocumentos += usuario.documentos.length;
      }

      if (usuario.agendamento) {
        this.totalAgendamentos++;
      }

      if (usuario.avaliacao) {
        this.totalAvaliacoes++;
      }

      switch (usuario.status) {

        case 'Aprovado':
          this.aprovados++;
          break;

        case 'Reprovado':
          this.reprovados++;
          break;

        default:
          this.emAnalise++;
          break;

      }

    });

    this.ultimosUsuarios = [...this.usuarios]
      .reverse()
      .slice(0, 5);

    this.ultimosAgendamentos = this.usuarios
      .filter(usuario => usuario.agendamento)
      .reverse()
      .slice(0, 5);

  }

}