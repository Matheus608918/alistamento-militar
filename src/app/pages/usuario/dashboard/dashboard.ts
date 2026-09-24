import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  usuario: Usuario = {} as Usuario;

  quantidadeDocumentos = 0;

  status = 'Em análise';

  proximaEtapa = 'Aguardando análise da Junta Militar';

  dataCadastro = '';

  agendamento: any = null;

  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {

    const usuario = this.usuarioService.buscarUsuarioLogado();

    if (usuario) {

      this.usuario = usuario;

      this.quantidadeDocumentos =
        usuario.documentos?.length || 0;

      this.status =
        (usuario as any).status || 'Em análise';

      this.agendamento =
        (usuario as any).agendamento || null;

      this.dataCadastro =
        (usuario as any).dataCadastro ||
        new Date().toLocaleDateString('pt-BR');

      switch (this.status) {

        case 'Aprovado':

          this.proximaEtapa =
            'Aguardar convocação para incorporação.';

          break;

        case 'Reprovado':

          this.proximaEtapa =
            'Processo encerrado.';

          break;

        case 'Avaliação Médica Agendada':

          this.proximaEtapa =
            'Compareça na data e horário da avaliação médica.';

          break;

        default:

          this.proximaEtapa =
            'Aguardando análise da Junta Militar.';

      }

    }

  }

}