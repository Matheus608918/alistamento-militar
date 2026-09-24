import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendamentos.html',
  styleUrl: './agendamentos.css'
})
export class Agendamentos implements OnInit {

  usuarios: any[] = [];

  agendamentos: any[] = [];

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {

    this.usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    this.agendamentos = [];

    this.usuarios.forEach((usuario: any, usuarioIndex: number) => {

      if (usuario.agendamento) {

        this.agendamentos.push({

          usuario: usuario.nome,

          cpf: usuario.cpf,

          data: usuario.agendamento.data,

          horario: usuario.agendamento.horario,

          local: usuario.agendamento.local,

          medico: usuario.agendamento.medico,

          status: usuario.agendamento.status,

          usuarioIndex

        });

      }

    });

  }

  alterarStatus(agendamento: any, status: string) {

    agendamento.status = status;

    this.usuarios[
      agendamento.usuarioIndex
    ].agendamento.status = status;

    localStorage.setItem(
      'usuarios',
      JSON.stringify(this.usuarios)
    );

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    if (
      usuarioLogado.email ===
      this.usuarios[agendamento.usuarioIndex].email
    ) {

      const { senha, ...semSenha } =
        this.usuarios[agendamento.usuarioIndex];

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(semSenha)
      );

    }

    alert('Status do agendamento atualizado com sucesso.');

  }

}