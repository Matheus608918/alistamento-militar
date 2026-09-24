import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  usuarios: any[] = [];

  medico: any = {};

  avaliacoesHoje = 0;

  pendentes = 0;

  finalizadas = 0;

  pacientesHoje: any[] = [];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {

    this.medico = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    this.carregarPacientes();

  }

  carregarPacientes() {

    this.usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    this.avaliacoesHoje = 0;
    this.pendentes = 0;
    this.finalizadas = 0;
    this.pacientesHoje = [];

    this.usuarios.forEach(usuario => {

      if (
        usuario.agendamento &&
        (
          usuario.agendamento.status === 'Agendado' ||
          usuario.agendamento.status === 'Confirmado'
        ) &&
        usuario.agendamento.medico === this.medico.nome
      ) {

        this.avaliacoesHoje++;

        if (usuario.avaliacao) {

          this.finalizadas++;

        } else {

          this.pendentes++;
          this.pacientesHoje.push(usuario);

        }

      }

    });

  }

  avaliar(usuario: any): void {

    localStorage.setItem(
      'pacienteSelecionado',
      usuario.email
    );

    this.router.navigate([
      '/medico/avaliacao'
    ]);

  }

}