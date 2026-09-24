import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alistamentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alistamentos.html',
  styleUrl: './alistamentos.css'
})
export class Alistamentos implements OnInit {

  usuarios: any[] = [];

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );
  }

  alterarStatus(usuario: any, status: string) {

    usuario.status = status;

    localStorage.setItem(
      'usuarios',
      JSON.stringify(this.usuarios)
    );

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    if (usuarioLogado.email === usuario.email) {

      const { senha, ...semSenha } = usuario;

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(semSenha)
      );

    }

    alert('Status atualizado com sucesso.');

  }

}