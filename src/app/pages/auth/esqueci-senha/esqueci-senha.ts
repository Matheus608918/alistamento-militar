import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiService } from '../../../services/api.service';
import { Button } from '../../../shared/components/button/button';

/*
 Recuperação de senha (versão simples):
 a pessoa informa o e-mail, o pedido fica registrado e o administrador
 define uma nova senha e avisa a pessoa.
 */
@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Button
  ],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.css'
})
export class EsqueciSenha {

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  email = '';

  erro = '';

  sucesso = '';

  enviando = false;

  async enviar(): Promise<void> {

    this.erro = '';
    this.sucesso = '';

    const email = this.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.erro = 'Informe um e-mail válido.';
      return;
    }

    this.enviando = true;

    try {

      await this.api.solicitarNovaSenha(email);

      // A mensagem é a mesma exista ou não o e-mail, para não revelar quem tem cadastro
      this.sucesso =
        'Pedido registrado. Se este e-mail estiver cadastrado, a administração vai definir ' +
        'uma nova senha e entrar em contato pelo e-mail ou telefone do cadastro.';

      this.email = '';

    } catch (erro) {

      if (erro instanceof HttpErrorResponse && erro.status === 0) {
        this.erro = 'Não foi possível conectar à API. Tente novamente mais tarde.';
      } else {
        this.erro =
          'Não foi possível registrar o pedido agora. Procure a administração da ' +
          'Junta de Serviço Militar para redefinir sua senha.';
      }

    } finally {

      this.enviando = false;
      this.cdr.markForCheck();

    }

  }

}