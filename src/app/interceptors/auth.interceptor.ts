import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('authToken');

  if (token) {
    const clonado = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(clonado);
  }

  return next(req);

};