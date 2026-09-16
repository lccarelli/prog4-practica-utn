import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Loading } from '../services/loading';
import { Apod } from '../interfaces/apod';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url !== environment.NASA_URL) {
    return next(req);
  }

  const loading = inject(Loading);
  loading.cargando.set(true);

  const reqConApiKey = req.clone({
    params: req.params.set('api_key', environment.NASA_KEY),
  });

  return next(reqConApiKey).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        loading.cargando.set(false);
      }
    }),
    map((event) => {
      if (event.type === HttpEventType.Response) {
        const apod = event.body as Apod;
        if (apod.media_type === 'video') {
          return event.clone({ body: { ...apod, url: 'error.svg' } });
        }
      }
      return event;
    }),
  );
};
