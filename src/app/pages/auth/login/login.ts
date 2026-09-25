import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Button
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  login = {
    email: '',
    senha: ''
  };

  erro = '';

  carregando = false;

  async entrar(): Promise<void> {

    this.erro = '';

    if (!this.login.email.trim() || !this.login.senha) {

      this.erro = 'Preencha o e-mail e a senha.';

      return;

    }

    this.carregando = true;

    try {

      const destino = await this.auth.entrar(
        this.login.email,
        this.login.senha
      );

      await this.router.navigateByUrl(destino);

    } catch (erro) {

      this.erro = erro instanceof Error
        ? erro.message
        : 'E-mail ou senha inválidos.';

      this.login.senha = '';

    } finally {

      this.carregando = false;

      this.cdr.markForCheck();

    }

  }

}