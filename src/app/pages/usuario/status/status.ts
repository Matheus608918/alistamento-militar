import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class Status implements OnInit {

  cadastro = 'Concluído';
  cadastroComplementar = 'Concluído';
  documentos = 'Pendente';
  analise = 'Aguardando documentos';
  avaliacao = 'Aguardando';
  resultado = 'Pendente';

  ngOnInit(): void {

    const usuario = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    if (!usuario || !usuario.email) {
      return;
    }

    // DOCUMENTOS
    if (usuario.documentos && usuario.documentos.length > 0) {

      const todosAprovados = usuario.documentos.every(
        (doc: any) => doc.status === 'Aprovado'
      );

      if (todosAprovados) {

        this.documentos = 'Aprovados';

      } else {

        this.documentos = 'Em análise';

      }

    }

    // ANÁLISE
    if (usuario.status === 'Em análise') {

      this.analise = 'Em análise';

    }

    // AGENDAMENTO
    if (usuario.agendamento) {

      this.analise = 'Concluída';

      this.avaliacao = 'Agendada';

    }

    // AVALIAÇÃO MÉDICA
    if (
      usuario.avaliacao &&
      usuario.avaliacao.resultado
    ) {

      this.avaliacao = 'Concluída';

      this.resultado = usuario.avaliacao.resultado;

    }

    // RESULTADO FINAL
    if (
      usuario.status === 'Aprovado' ||
      usuario.status === 'Reprovado'
    ) {

      this.resultado = usuario.status;

    }

  }

}