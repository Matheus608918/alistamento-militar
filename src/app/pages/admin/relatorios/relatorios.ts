import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css'
})
export class Relatorios implements OnInit {

  usuarios: any[] = [];
  medicos: any[] = [];

  totalUsuarios = 0;
  totalMedicos = 0;
  totalDocumentos = 0;
  totalAgendamentos = 0;
  totalAvaliacoes = 0;

  aprovados = 0;
  reprovados = 0;
  emAnalise = 0;

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  carregarRelatorio(): void {

    const todosUsuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    // Apenas cidadãos
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

  }

  exportarRelatorio(): void {

    const relatorio = `
===== RELATÓRIO DO SISTEMA =====

Cidadãos: ${this.totalUsuarios}
Médicos: ${this.totalMedicos}

Documentos: ${this.totalDocumentos}
Agendamentos: ${this.totalAgendamentos}
Avaliações: ${this.totalAvaliacoes}

Aprovados: ${this.aprovados}
Reprovados: ${this.reprovados}
Em análise: ${this.emAnalise}
`;

    const blob = new Blob(
      [relatorio],
      { type: 'text/plain;charset=utf-8' }
    );

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);

    link.download = 'relatorio.txt';

    link.click();

    URL.revokeObjectURL(link.href);

  }

}