import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css'
})
export class Documentos implements OnInit {

  usuarios: any[] = [];

  documentos: any[] = [];

  ngOnInit(): void {
    this.carregarDocumentos();
  }

  carregarDocumentos() {

    this.usuarios = JSON.parse(
      localStorage.getItem('usuarios') || '[]'
    );

    this.documentos = [];

    this.usuarios.forEach((usuario: any, usuarioIndex: number) => {

      if (usuario.documentos) {

        usuario.documentos.forEach((documento: any, documentoIndex: number) => {

          this.documentos.push({

            usuario: usuario.nome,

            cpf: usuario.cpf,

            tipo: documento.tipo,

            nomeArquivo: documento.nomeArquivo,

            dataEnvio: documento.dataEnvio,

            status: documento.status || 'Em análise',

            usuarioIndex,

            documentoIndex

          });

        });

      }

    });

  }

  alterarStatus(documento: any, status: string) {

    documento.status = status;

    this.usuarios[documento.usuarioIndex]
      .documentos[documento.documentoIndex]
      .status = status;

    localStorage.setItem(
      'usuarios',
      JSON.stringify(this.usuarios)
    );

    const usuarioLogado = JSON.parse(
      localStorage.getItem('usuarioLogado') || '{}'
    );

    if (
      usuarioLogado.email ===
      this.usuarios[documento.usuarioIndex].email
    ) {

      const { senha, ...semSenha } =
        this.usuarios[documento.usuarioIndex];

      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(semSenha)
      );

    }

    alert('Status do documento atualizado com sucesso.');

  }

}