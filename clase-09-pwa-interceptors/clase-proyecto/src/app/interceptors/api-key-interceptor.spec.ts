import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { apiKeyInterceptor } from './api-key-interceptor';
import { Apod } from '../interfaces/apod';

describe('apiKeyInterceptor', () => {
  let http: HttpClient;
  let control: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiKeyInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    control = TestBed.inject(HttpTestingController);
  });

  it('agrega la api_key a las peticiones de la NASA', () => {
    http.get(environment.NASA_URL).subscribe();
    const req = control.expectOne((r) => r.url === environment.NASA_URL);
    expect(req.request.params.get('api_key')).toBe(environment.NASA_KEY);
    req.flush({ media_type: 'image', url: 'foto.jpg' });
  });

  it('reemplaza los videos por la imagen de error', () => {
    let recibido: Apod | undefined;
    http.get<Apod>(environment.NASA_URL).subscribe((r) => (recibido = r));
    control
      .expectOne((r) => r.url === environment.NASA_URL)
      .flush({ media_type: 'video', url: 'video.mp4' });
    expect(recibido?.url).toBe('error.svg');
  });

  it('no toca peticiones a otras URLs', () => {
    http.get('https://otra.api/datos').subscribe();
    const req = control.expectOne('https://otra.api/datos');
    expect(req.request.params.has('api_key')).toBe(false);
    req.flush({});
  });
});
