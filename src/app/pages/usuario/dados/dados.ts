import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-dados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dados.html',
  styleUrl: './dados.css'
})
export class Dados implements OnInit {

  usuario: Usuario = {} as Usuario;

  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {

    const usuario = this.usuarioService.buscarUsuarioLogado();

    if (usuario) {
      this.usuario = usuario;
    }

  }

}