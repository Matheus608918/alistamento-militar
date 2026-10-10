import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
export class Login implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private rota = inject(ActivatedRoute);

  login = {
    email: '',
    senha: ''
  };

  erro = '';

  carregando = false;

  // Aviso mostrado quando o token JWT venceu (a sessão dura 2 horas)
  aviso = '';

  ngOnInit(): void {

    if (this.rota.snapshot.queryParamMap.get('sessao') === 'expirada') {
      this.aviso = 'Sua sessão expirou. Entre novamente para continuar.';
    }

  }

  async entrar(): Promise<void> {

    this.erro = '';
    this.aviso = '';

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