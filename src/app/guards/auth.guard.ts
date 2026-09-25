import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth';
import { CadastroRascunhoService } from '../services/cadastro-rascunho.service';

export const authGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.verificarSessao()
    ? true
    : router.createUrlTree(['/login']);

};

export const roleGuard: CanActivateFn = (rota) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.verificarSessao()) {
    return router.createUrlTree(['/login']);
  }

  const perfisPermitidos: string[] = rota.data?.['perfis'] ?? [];

  if (perfisPermitidos.length === 0 || auth.temPerfil(perfisPermitidos)) {
    return true;
  }

  return router.createUrlTree([auth.rotaInicial(auth.perfil())]);

};

export const rascunhoCadastroGuard: CanActivateFn = () => {

  const rascunho = inject(CadastroRascunhoService);
  const router = inject(Router);

  return rascunho.temRascunho()
    ? true
    : router.createUrlTree(['/cadastro']);

};