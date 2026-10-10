import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL } from '../core/api-config';
import { AuthService } from '../services/auth';

/*
 Interceptor do JWT.
 Toda requisição para a API (menos login e cadastro) sai com o cabeçalho
 "Authorization: Bearer <token>". O token é gerado pela API no login,
 vale 2 horas e é conferido pela API em toda requisição.
 */
const ROTAS_PUBLICAS = [
  'POST /usuario',
  'POST /usuario/login',
  'POST /medico/login',
  'POST /administrador/login',
  'POST /auth/login',
  'POST /recuperacao-senha'
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

  // Token vencido: encerra a sessão antes mesmo de chamar a API
  if (auth.token && !auth.tokenValido()) {
    auth.sair(true);
    return next(req);
  }

  const token = auth.token;

  if (!token) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  })).pipe(

    catchError((erro: unknown) => {

      // 401: a API recusou o token (vencido, alterado ou usuário removido)
      if (erro instanceof HttpErrorResponse && erro.status === 401) {
        auth.sair(true);
      }

      return throwError(() => erro);

    })

  );

};