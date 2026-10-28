import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const clon = req.clone({
    // Sin esto el navegador no guarda ni manda las cookies.
    credentials: 'include',
    headers: token ? req.headers.set('Authorization', 'Bearer ' + token) : req.headers,
  });
  return next(clon);
};
