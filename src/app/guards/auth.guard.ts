import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }

  router.navigate(['/login']);

  return false;

};

export const roleGuard: CanActivateFn = (rota) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.autenticado()) {

    router.navigate(['/login']);

    return false;

  }

  const perfisPermitidos: string[] = rota.data?.['perfis'] ?? [];

  if (perfisPermitidos.length === 0) {
    return true;
  }

  if (auth.temPerfil(perfisPermitidos)) {
    return true;
  }

  router.navigate([auth.rotaInicial(auth.perfil() ?? undefined)]);

  return false;

};