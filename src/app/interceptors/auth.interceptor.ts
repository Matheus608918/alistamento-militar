import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '../core/api-config';
import { AuthService } from '../services/auth';

const ROTAS_PUBLICAS = [
  'POST /usuario',
  'POST /usuario/login',
  'POST /medico/login',
  'POST /administrador/login'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  const caminho = req.url.substring(API_BASE_URL.length).split('?')[0];

  if (ROTAS_PUBLICAS.includes(`${req.method} ${caminho}`)) {
    return next(req);
  }

  const auth = inject(AuthService);

  if (auth.token && !auth.tokenValido()) {
    auth.sair();
    return next(req);
  }

  const token = auth.token;

  if (!token) {
    return next(req);
  }

  const valor = `Bearer ${token}`;

  return next(req.clone({
    setHeaders: {
      Authorization: valor,
      Authentization: valor
    }
  }));

};