import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendamento.html',
  styleUrl: './agendamento.css'
})
export class Agendamento implements OnInit {

  confirmado = false;

  agendamento: any = null;

  usuario: any = null;

  ngOnInit(): void {

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    const usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    this.usuario = usuarios.find(
      (u: any) => u.email === usuarioLogado.email
    );

    if (!this.usuario) {
      return;
    }

    this.agendamento = this.usuario.agendamento || null;

    this.confirmado =
      this.agendamento?.confirmado || false;

  }

  confirmarPresenca(): void {

    if (!this.usuario || !this.usuario.agendamento) {

      alert('Nenhum agendamento encontrado.');

      return;

    }

    this.confirmado = true;

    this.usuario.agendamento.confirmado = true;

    const usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    const indice = usuarios.findIndex(
      (u: any) => u.email === this.usuario.email
    );

    if (indice !== -1) {

      usuarios[indice] = this.usuario;

      localStorage.setItem(
        'usuarios',
        JSON.stringify(usuarios)
      );

      const { senha, ...usuarioSemSenha } = this.usuario;

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(usuarioSemSenha)
      );

    }

    alert('Presença confirmada com sucesso!');

  }

}