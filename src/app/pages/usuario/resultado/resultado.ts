import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultado.html',
  styleUrl: './resultado.css'
})
export class Resultado implements OnInit {

  nomeUsuario = '';

  dataCadastro = '';

  situacao = 'Em análise';

  proximaEtapa = 'Aguardando análise da Junta Militar';

  constructor(private router: Router) {}

  ngOnInit(): void {

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    const usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    const usuario = usuarios.find(
      (u: any) => u.email === usuarioLogado.email
    );

    if (!usuario) {
      return;
    }

    const { senha, ...usuarioSemSenha } = usuario;

    localStorage.setItem(
      'usuarioLogado',
      JSON.stringify(usuarioSemSenha)
    );

    this.nomeUsuario = usuario.nome || 'Usuário';

    this.dataCadastro =
      usuario.dataCadastro ||
      new Date().toLocaleDateString('pt-BR');

    this.situacao =
      usuario.status || 'Em análise';

    switch (this.situacao) {

      case 'Aprovado':

        this.proximaEtapa =
          'Você foi considerado APTO. Aguarde a convocação para incorporação.';

        break;

      case 'Reprovado':

        this.proximaEtapa =
          'Você foi dispensado do serviço militar. Procure a Junta Militar para mais informações.';

        break;

      case 'Avaliação Médica Agendada':

        this.proximaEtapa =
          'Compareça na data e horário informados para sua avaliação médica.';

        break;

      case 'Em análise':

        this.proximaEtapa =
          'Seus documentos estão sendo analisados pela Junta Militar.';

        break;

      default:

        this.proximaEtapa =
          'Aguardando atualização do processo.';

    }

  }

  voltarDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }

}